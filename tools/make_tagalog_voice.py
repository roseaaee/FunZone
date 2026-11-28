# Make a natural Filipino voice for every Tagalog line in FunZone.
#
#   pip install edge-tts                                  (free, no account needed)
#   python3 tools/make_tagalog_voice.py                   (Blessica, a Filipino woman's voice)
#   python3 tools/make_tagalog_voice.py --voice angelo    (Angelo, a Filipino man's voice)
#
# Or with your own Azure Speech key (free tier: 500,000 characters a month; FunZone needs about 41,000):
#   pip install requests
#   python3 tools/make_tagalog_voice.py --azure YOUR_KEY --region southeastasia
#
# Run it on your own computer (it needs the internet), from the FunZone folder.
# It reads voice/tl/lines.json (every Tagalog line the app says), saves voice/tl/<key>.mp3
# and writes voice/tl/index.json. The app then plays these files instead of the device voice.
# Lines that already have a file are skipped, so you can stop and run it again.
# To fix one line that sounds wrong: delete its .mp3 and run again, or record it yourself
# (Parent Mode > Voice recordings) — a parent's own voice is always the most natural.
import argparse, asyncio, json, os, sys
from xml.sax.saxutils import escape

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE_DIR = os.path.join(HERE, '..', 'voice', 'tl')
VOICES = {'blessica': 'fil-PH-BlessicaNeural', 'angelo': 'fil-PH-AngeloNeural'}

def main():
    ap = argparse.ArgumentParser(description='Make Filipino voice files for FunZone')
    ap.add_argument('--voice', default='blessica', choices=VOICES)
    ap.add_argument('--rate', default='-8%', help='speed, e.g. -8%% (a little slower for small children)')
    ap.add_argument('--azure', metavar='KEY', help='use the Azure Speech REST API with this key')
    ap.add_argument('--region', default='southeastasia', help='Azure region of your Speech resource')
    ap.add_argument('--only', type=int, default=0, help='make only the first N lines (to try it out)')
    a = ap.parse_args()
    lines = json.load(open(os.path.join(VOICE_DIR, 'lines.json'), encoding='utf-8'))
    if a.only: lines = lines[:a.only]
    voice = VOICES[a.voice]
    todo = [l for l in lines if not os.path.exists(os.path.join(VOICE_DIR, l['key'] + '.mp3'))]
    print(f'{len(lines)} lines, {len(todo)} still to make, voice {voice}')
    if a.azure: azure(todo, voice, a)
    else: asyncio.run(edge(todo, voice, a.rate))
    done = sorted(l['key'] for l in json.load(open(os.path.join(VOICE_DIR, 'lines.json'), encoding='utf-8'))
                  if os.path.exists(os.path.join(VOICE_DIR, l['key'] + '.mp3')))
    json.dump(done, open(os.path.join(VOICE_DIR, 'index.json'), 'w'))
    print(f'Done: {len(done)} voice files listed in voice/tl/index.json')

async def edge(todo, voice, rate):
    try: import edge_tts
    except ImportError: sys.exit('Please run:  pip install edge-tts')
    for i, l in enumerate(todo, 1):
        out = os.path.join(VOICE_DIR, l['key'] + '.mp3')
        for attempt in range(3):
            try:
                await edge_tts.Communicate(l['text'], voice, rate=rate).save(out); break
            except Exception as e:
                print('  retry:', e); await asyncio.sleep(2)
        print(f'[{i}/{len(todo)}] {l["text"][:70]}')

def azure(todo, voice, a):
    try: import requests
    except ImportError: sys.exit('Please run:  pip install requests')
    url = f'https://{a.region}.tts.speech.microsoft.com/cognitiveservices/v1'
    head = {'Ocp-Apim-Subscription-Key': a.azure, 'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'FunZone'}
    for i, l in enumerate(todo, 1):
        ssml = (f"<speak version='1.0' xml:lang='fil-PH'><voice name='{voice}'>"
                f"<prosody rate='{a.rate}'>{escape(l['text'])}</prosody></voice></speak>")
        r = requests.post(url, headers=head, data=ssml.encode('utf-8'), timeout=30)
        if r.status_code != 200: sys.exit(f'Azure said {r.status_code}: {r.text[:200]}  (check the key and region)')
        open(os.path.join(VOICE_DIR, l['key'] + '.mp3'), 'wb').write(r.content)
        print(f'[{i}/{len(todo)}] {l["text"][:70]}')

if __name__ == '__main__':
    main()
