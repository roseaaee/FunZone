import json,re,collections
from story_cast import CAST
books=json.load(open('books.json'))
VERB_EN=r"(?:said|says|asked|cried|called|shouted|yelled|laughed|smiled|whispered|sang|sung|bragged|hooted|replied|answered|growled|roared|squeaked|sighed|grumbled|cheered|giggled|snapped|boomed|chirped|croaked|added|begged|wailed|sobbed|gasped|told|thought|muttered|squealed|hissed|barked|clucked|quacked|neighed|puffed|huffed|snorted|purred|declared|exclaimed|explained|promised|warned|teased|scolded|insisted|agreed|whimpered|beamed|grinned|nodded|winked|chuckled|panted|called out|cried out|sniffed|wondered|squawked|mooed|bleated|honked|tooted|chanted|screamed|hollered|groaned|moaned|cooed|crowed|answered|whined|announced|ordered|commanded|pleaded|boasted|sneered|cackled|chuckled|spoke|thundered|bellowed|meowed|oinked|woofed|baaed|tweeted|hummed|stammered|stuttered|mumbled|sniffled|yawned|whooped|shrieked|peeped|honked|buzzed|trumpeted)"
VERB_TL=r"(?:atungal|ungol|angil|paliwanag|paalala|sabi|sagot|sigaw|tanong|bulong|tawag|iyak|hiyaw|wika|dagdag|tugon|sambit|pakiusap|utos|biro|tawa|daing|reklamo|sumigaw|sumagot|nagtanong|bumulong|tumawa|umiyak|sinabi|tinanong|isinigaw|ibinulong|hiling|aniya|anya)"
PRON={'he':'m','him':'m','his':'m','she':'f','her':'f','niya':'a','niyang':'a','kaniyang':'a','kanyang':'a','siya':'a','siyang':'a','nito':'a'}
MALE={'boy','man','oldman','big'}; FEM={'girl','woman','oldwoman'}
out={}; stats=collections.Counter()
for b in books:
    cast=[]
    for al,ty in CAST[b['id']].items():
        names=al.split('|'); canon=names[0]
        for n in names: cast.append((n,canon,ty))
    cast.sort(key=lambda x:-len(x[0]))
    def mentions(txt):
        res=[]
        for n,c,ty in cast:
            flags=0 if n[0].isupper() else re.I
            for m in re.finditer(r'(?<![\w-])'+re.escape(n)+r'(?![\w-])',txt,flags): res.append((m.start(),m.end(),c,ty))
        res.sort(); keep=[]; end=-1
        for r in res:
            if r[0]>=end: keep.append(r); end=r[1]
        return keep
    def subject_of(txt, gender=None):
        if txt.count('"')%2: txt=txt.split('"',1)[1]   # context cut mid-quote: drop the broken start
        txt=re.sub(r'"[^"]*"','',txt)   # names inside quotes are people being spoken to
        for s_ in reversed(re.split(r'(?<=[.!?])\s',txt)):
            ms=[m for m in mentions(s_) if not (gender=='m' and m[3] in FEM) and not (gender=='f' and m[3] in MALE)]
            if not ms: continue
            si=[m for m in ms if re.search(r'\b[Ss]i\s*$',s_[:m[0]])]
            return (si or ms)[0][2]
        return None
    def last_mention(txt, gender=None):
        ms=mentions(txt)
        for m in reversed(ms):
            ty=m[3]
            if gender=='m' and ty in FEM: continue
            if gender=='f' and ty in MALE: continue
            return m[2]
        return None
    typ={c:ty for n,c,ty in cast if not ty.startswith('~')}
    book_ctx=['']
    def resolve(c):
        ty=dict((cc,tt) for n,cc,tt in cast).get(c,'')
        if not ty.startswith('~'): return c
        opts=ty[1:].split(','); best=None; pos=-1
        for o in opts:
            i=book_ctx[0].rfind(o)
            if i>pos: pos=i; best=o
        return best or opts[0]
    book_out=[]; prev_sp=None; others=[]
    for p in b['pages']:
        t=p['en']; parts=re.split(r'("[^"]*")',t); sp_page=[]; ctx=''
        for i,seg in enumerate(parts):
            if not seg.startswith('"'): ctx+=seg; continue
            after=(parts[i+1] if i+1<len(parts) else '')
            before=parts[i-1] if i>0 else ''
            sp=None; how=''
            tag=re.split(r'(?<=[.!?])\s',after,maxsplit=1)[0][:90]
            comma=seg.rstrip('"').rstrip()[-1:] in (',',)
            SPEECH=VERB_EN.replace('smiled|','').replace('laughed|','').replace('giggled|','').replace('beamed|','').replace('grinned|','').replace('nodded|','').replace('winked|','').replace('chuckled|','').replace('sighed|','')
            V=(VERB_EN if comma else SPEECH)
            VT=(VERB_TL[:-1]+'|hagikgik|humagikgik|buntong-hininga|gulat|awit|kanta|ngiti|nakangiti)' if comma else VERB_TL)
            names_re='(?:'+'|'.join(re.escape(n) for n,c,ty in cast)+r'|he|she|they|it|I)'
            strong=re.match(r'\s*,?\s*(?:(?:the|a|his|her|little|old|big)\s+)*'+names_re+r'(?:\s+\w+ly)?\s+'+V+r'\b',tag,re.I) or re.match(r'\s*,?\s*'+V+r'\s+(?:the\s+)?',tag,re.I) \
                or re.match(r'\s*,?\s*(?:\w+\s+){0,2}'+VT+r'\b',tag,re.I)
            if strong:
                ms=mentions(tag)
                if ms: sp=ms[0][2]; how='after'
                else:
                    pm=re.search(r'\b(he|she|niya|niyang|kaniyang|kanyang|siya|siyang|they|nila|nilang)\b',tag,re.I)
                    if pm and pm.group(1).lower() in ('they','nila','nilang'): sp='_crowd'; how='crowd'
                    elif pm: g=PRON[pm.group(1).lower()]; sp=subject_of(book_ctx[0][-600:]+' '+ctx,None if g=='a' else g) or prev_sp; how='afterpron'
            if not sp:
                clause=re.split(r'(?<=[.!?])\s',before)[-1]
                if re.search(r'(?:'+VERB_EN+r'|'+VERB_TL+r')\b[^.!?]{0,25}[,:]?\s*$',clause,re.I) or clause.rstrip().endswith(':'):
                    ms=mentions(clause)
                    if ms: sp=ms[0][2]; how='before'
                    else:
                        pm=re.search(r'\b(he|she|niya|siya)\b',clause,re.I)
                        if pm: g=PRON[pm.group(1).lower()]; sp=last_mention(ctx,None if g=='a' else g) or prev_sp; how='beforepron'
            if not sp:
                if before.strip()=='' and prev_sp and i>1:                         # two quotes in a row: someone answers
                    alt=[o for o in reversed(others) if o!=prev_sp]
                    sp=alt[0] if alt else prev_sp; how='alt'
                else:
                    sent=re.split(r'(?<=[.!?])\s',before.strip())
                    for s_ in reversed(sent[-2:]):
                        ms=mentions(s_)
                        if ms: sp=ms[0][2]; how='prevsent'; break
                if not sp and i==1:                                     # first words on the page with no tag: who acts next?
                    ms=mentions(re.split(r'(?<=[.!?])\s',after.strip(),maxsplit=1)[0])
                    if ms: sp=ms[0][2]; how='nextactor'
                if not sp: sp=prev_sp; how='cont' if sp else ''
            sp=resolve(sp) if sp else sp
            stats[how or 'none']+=1
            sp_page.append(sp)
            if sp: prev_sp=sp; others.append(sp)
            ctx+=seg
        book_ctx[0]+=' '+t
        book_out.append(sp_page)
    out[b['id']]={'types':typ,'pages':book_out}
import story_fixes; story_fixes.apply(out)
json.dump(out,open('speakers.json','w'),ensure_ascii=False,indent=0)
print(stats)
