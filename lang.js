'use strict';
/* =====================================================
   FunZone languages: English (en) and Tagalog (tl)
   - FZ.t(key)        text for the app screens
   - FZ.g(game, f)    game description in the chosen language
   - FZ.tr(text)      translates in-game messages (English source -> Tagalog)
   ===================================================== */

/* ---------- app screens ---------- */
FZ.UI = {
  parents:      { en: '🔒 Parents', tl: '🔒 Magulang' },
  cat_all:      { en: 'All', tl: 'Lahat' },
  cat_tag:      { en: 'Chasing', tl: 'Habulan' },
  cat_jump:     { en: 'Jumping', tl: 'Talon' },
  cat_skill:    { en: 'Skills', tl: 'Husay' },
  cat_board:    { en: 'Board', tl: 'Board' },
  mascot:       { en: ['Hello! I\'m Kabaw. Pick a game to play!', 'Let\'s play like the kids of long ago!', 'Which game do you want to try today?', 'Come on, let\'s play! 🎉'],
                  tl: ['Kumusta! Ako si Kabaw. Pumili ng laro!', 'Laro tayo na parang mga bata noong unang panahon!', 'Anong laro ang gusto mong subukan ngayon?', 'Tara, laro tayo! 🎉'] },
  choose_me:    { en: 'My player:', tl: 'Ang player ko:' },
  boy:          { en: 'Boy', tl: 'Lalaki' },
  girl:         { en: 'Girl', tl: 'Babae' },
  foot:         { en: 'Laro ng Lahi · Games of the Filipino people 🇵🇭', tl: 'Laro ng Lahi · Mga laro ng mga Pilipino 🇵🇭' },
  lang_title:   { en: 'Choose your language', tl: 'Pumili ng wika' },
  lang_hi:      { en: 'Pick a language / Pumili ng wika', tl: 'Pumili ng wika / Pick a language' },
  in_real:      { en: '🌳 In real life', tl: '🌳 Sa totoong buhay' },
  in_game:      { en: '🎮 In FunZone', tl: '🎮 Sa FunZone' },
  lets_play:    { en: '▶️ Let\'s Play!', tl: '▶️ Laro Tayo!' },
  read_me:      { en: 'Read to me', tl: 'Basahin para sa akin' },
  back:         { en: 'Back', tl: 'Bumalik' },
  how_to:       { en: 'How to play', tl: 'Paano laruin' },
  how_title:    { en: '🎮 How to play:', tl: '🎮 Paano laruin:' },
  ok:           { en: '👍 OK!', tl: '👍 Sige!' },
  cheers:       { en: ['Great job!', 'Bravo!', 'Well done!', 'Hooray!', 'You\'re so good!'], tl: ['Galing!', 'Bravo!', 'Magaling!', 'Hooray!', 'Ang husay mo!'] },
  great_play:   { en: g => `Great job playing ${g}!`, tl: g => `Galing mo sa paglaro ng ${g}!` },
  again:        { en: '🔁 Play again', tl: '🔁 Ulitin' },
  more:         { en: '🏠 More games', tl: '🏠 Iba pang laro' },
  say_great:    { en: 'Great job!', tl: 'Magaling!' },
  read_intro:   { en: ['In real life.', 'In this game.'], tl: ['Sa totoong buhay.', 'Sa larong ito.'] },
  parents_only: { en: 'Parents only', tl: 'Para sa magulang' },
  enter_pin:    { en: 'Enter your 4-digit PIN', tl: 'Ilagay ang 4-digit na PIN' },
  cancel:       { en: 'Cancel', tl: 'Kanselahin' },
  unlock_title: { en: 'Grown-up unlock', tl: 'Para sa nakatatanda' },
  parent_mode:  { en: '👨‍👩‍👧 Parent Mode', tl: '👨‍👩‍👧 Pang-magulang' },
  back_kid:     { en: '🧒 Back to Kid Mode', tl: '🧒 Balik sa Pambata' },
  tab_progress: { en: '📊 Progress', tl: '📊 Progreso' },
  tab_settings: { en: '⚙️ Settings', tl: '⚙️ Mga Setting' },
  summary:      { en: '📊 Summary', tl: '📊 Buod' },
  total_stars:  { en: 'Total stars collected', tl: 'Kabuuang bituin' },
  games_tried:  { en: 'Games tried', tl: 'Mga larong nasubukan' },
  play_time:    { en: 'Play time this session', tl: 'Oras ng paglalaro ngayon' },
  min:          { en: 'min', tl: 'min' },
  each_game:    { en: '🎮 Each game', tl: '🎮 Bawat laro' },
  times_played: { en: n => `${n}× played`, tl: n => `${n}× nilaro` },
  snd_title:    { en: '🔊 Sound & voice', tl: '🔊 Tunog at boses' },
  snd_fx:       { en: 'Sound effects', tl: 'Mga tunog' },
  snd_voice:    { en: 'Read hints out loud (great for kids who can\'t read yet)', tl: 'Basahin nang malakas ang mga hint (para sa batang hindi pa nakakabasa)' },
  lang_row:     { en: '🌐 Language', tl: '🌐 Wika' },
  limit_title:  { en: '⏰ Screen-time limit', tl: '⏰ Limitasyon sa oras ng paglalaro' },
  limit_lbl:    { en: 'Remind child to rest after', tl: 'Paalalahanang magpahinga pagkatapos ng' },
  no_limit:     { en: 'No limit', tl: 'Walang limitasyon' },
  minutes:      { en: n => `${n} minutes`, tl: n => `${n} minuto` },
  limit_note:   { en: 'When time is up, FunZone shows a rest screen. Only a grown-up can unlock it with the PIN.', tl: 'Kapag tapos na ang oras, magpapakita ang FunZone ng pahingang screen. Ang nakatatanda lang ang makakabukas nito gamit ang PIN.' },
  pin_title:    { en: '🔐 Parent PIN', tl: '🔐 PIN ng magulang' },
  pin_new:      { en: 'New 4-digit PIN', tl: 'Bagong 4-digit na PIN' },
  pin_save:     { en: 'Save PIN', tl: 'I-save ang PIN' },
  pin_saved:    { en: '✅ PIN saved!', tl: '✅ Na-save na ang PIN!' },
  pin_bad:      { en: '⚠️ Please enter exactly 4 digits.', tl: '⚠️ Maglagay ng eksaktong 4 na numero.' },
  data_title:   { en: '🧹 Data', tl: '🧹 Datos' },
  data_erase:   { en: 'Erase all stars and progress', tl: 'Burahin ang lahat ng bituin at progreso' },
  reset:        { en: 'Reset', tl: 'I-reset' },
  confirm_reset:{ en: 'Erase all stars and progress?', tl: 'Buburahin ang lahat ng bituin at progreso?' },
  priv_title:   { en: '🔒 Privacy notice', tl: '🔒 Paunawa sa privacy' },
  priv: { en: [
      '<b>Nothing is collected.</b> FunZone has no accounts and never asks for your child\'s name, age, photo, voice or location.',
      '<b>Everything stays on this device.</b> Stars, settings and your PIN (stored scrambled) are saved only in this browser. Nothing is uploaded or shared, and there are no ads or trackers.',
      '<b>Read-aloud</b> uses your device\'s built-in voice. Some devices may process speech online, depending on the voice installed.',
      '<b>Delete anytime:</b> use "Reset" above, or clear this site\'s data in your browser settings.'],
    tl: [
      '<b>Walang kinokolekta.</b> Walang account sa FunZone at hindi nito hinihingi ang pangalan, edad, larawan, boses o lokasyon ng anak mo.',
      '<b>Nananatili ang lahat sa device na ito.</b> Ang mga bituin, setting at PIN (nakatago ang anyo) ay naka-save lang sa browser na ito. Walang ina-upload o ibinabahagi, at walang ads o trackers.',
      '<b>Ang pagbasa nang malakas</b> ay gumagamit ng built-in na boses ng device mo. Sa ilang device, maaaring naiproseso online ang boses depende sa naka-install.',
      '<b>Burahin anumang oras:</b> gamitin ang "I-reset" sa itaas, o burahin ang data ng site na ito sa settings ng browser.'] },
  you_need:     { en: '🧰 <b>You need:</b>', tl: '🧰 <b>Kailangan:</b>' },
  parent_tip:   { en: '💡 <b>Parent tip:</b>', tl: '💡 <b>Tip para sa magulang:</b>' },
  rest_title:   { en: 'Time to rest!', tl: 'Pahinga muna!' },
  rest_text:    { en: 'Time to rest your eyes and go play outside!<br>Ask a grown-up to unlock more play time.', tl: 'Magpahinga muna ang mata at maglaro sa labas!<br>Magpatulong sa nakatatanda para magbukas ng dagdag na oras.' },
  rest_say:     { en: 'Time to rest! Ask a grown up.', tl: 'Pahinga muna! Magpatulong sa nakatatanda.' },
  unlock_btn:   { en: '👨‍👩‍👧 Grown-up unlock', tl: '👨‍👩‍👧 Buksan ng nakatatanda' },
  hello:        { en: 'Hello!', tl: 'Kumusta!' },
  dress_btn:    { en: '👕 Dress-up', tl: '👕 Bihis' },
  dress_title:  { en: '👕 Dress-up', tl: '👕 Bihis' },
  dress_boy:    { en: 'Boy', tl: 'Lalaki' },
  dress_girl:   { en: 'Girl', tl: 'Babae' },
  dress_surprise: { en: '🎲 Surprise me', tl: '🎲 Sorpresahin ako' },
  dress_skin:   { en: 'Skin', tl: 'Kulay ng balat' },
  dress_hair:   { en: 'Hair', tl: 'Buhok' },
  dress_shirt:  { en: 'T-shirt', tl: 'T-shirt' },
  dress_shorts: { en: 'Shorts', tl: 'Shorts' },
  dress_shoes:  { en: 'Tsinelas', tl: 'Tsinelas' },
  dress_tip:    { en: 'Your player is used in every game!', tl: 'Ginagamit ang player mo sa bawat laro!' },
  digi_title:   { en: '📱 On FunZone it is a little different:', tl: '📱 Sa FunZone, medyo iba:' },
  badge_new:    { en: 'New badge!', tl: 'Bagong badge!' },
  total_short:  { en: 'Total', tl: 'Kabuuan' },
  tut_more:     { en: '📝 Read the steps', tl: '📝 Basahin ang mga hakbang' },
  tut_step:     { en: 'Step', tl: 'Hakbang' },
  tut_prev:     { en: 'Previous step', tl: 'Nakaraang hakbang' },
  tut_next:     { en: 'Next step', tl: 'Susunod na hakbang' },
  tut_play:     { en: 'Play', tl: 'Ipagpatuloy' },
  tut_pause:    { en: 'Pause', tl: 'Ihinto' },
  voice_pick:   { en: 'Voice', tl: 'Boses' },
  voice_auto:   { en: 'Automatic (best available)', tl: 'Awtomatiko (pinakamaganda)' },
  voice_test:   { en: '▶ Test', tl: '▶ Subukan' },
  voice_hi:     { en: 'Hello! Let\'s play together!', tl: 'Kumusta! Laro tayo!' },
  voice_note:   { en: 'Tip: voices marked Natural or Online usually sound the most human. You can add more voices in your device\'s text-to-speech settings.', tl: 'Tip: ang mga boses na may markang Natural o Online ang kadalasang pinakamalapit sa tunay na tao. Puwede kang magdagdag ng boses sa text-to-speech settings ng device mo.' },
  voice_no_tl:  { en: 'No Filipino voice found on this device. A similar voice is used for now. Install a Filipino (fil-PH) voice in your device\'s text-to-speech settings for the best result.', tl: 'Walang Filipino na boses sa device na ito. Pansamantalang gagamit ng katulad na boses. Mag-install ng Filipino (fil-PH) na boses sa text-to-speech settings para mas maganda.' }
};
FZ.t = (k, ...a) => { const e = FZ.UI[k]; if (!e) return k; const v = e[FZ.lang] !== undefined ? e[FZ.lang] : e.en; return typeof v === 'function' ? v(...a) : v; };
FZ.g = (g, f) => (FZ.lang === 'tl' && FZ.TLG[g.id] && FZ.TLG[g.id][f]) || g[f];

/* ---------- game descriptions in Tagalog ---------- */
FZ.TLG = {
  patintero: {
    tag: 'Tumawid sa mga linya… at huwag magpahuli sa taya!',
    players: '6–10 bata (2 koponan)', props: 'Tisa o patpat na pangguhit ng mga linya sa lupa',
    real: [
      'Dalawang koponan ang naglalaro sa mga linyang iginuhit sa lupa: ilang linyang magkakatabi at isang mahabang linya sa gitna.',
      'Nakatayo ang mga <b>bantay</b> (taya) SA mga linya, at puwede lang silang gumalaw sa kanilang linya. Ang <b>patotot</b> ang nagbabantay sa mahabang linya sa gitna.',
      'Ang mga <b>tumatawid</b> ay kailangang makatawid sa lahat ng linya, makarating sa dulo, at makabalik nang hindi nahahawakan.',
      'Kapag may natayaan, magpapalit ng puwesto ang mga koponan. Bawat makabalik nang ligtas ay may puntos!'],
    how: [
      'Ikaw ang tumatawid. Gamitin ang mga arrow para lumakad nang isang kahon.',
      'Pakaliwa at pakanan ang galaw ng mga bantay na pula ang damit sa kanilang linya. Ang patotot (lilang damit) ay pataas at pababa sa gitnang linya.',
      'Tumakbo papunta sa ⭐, at bumalik sa 🏠. Kapag natayaan ka, magsisimula ka ulit.'],
    tip: 'Gumuhit ng 3 linya na may layong 3 malalaking hakbang, at isang mahabang linya sa gitna. Hayaang maging tumatawid muna ang bata, saka maging bantay para maranasan niya ang dalawa.' },
  agawan: {
    tag: 'Agawin ang base ng kabilang koponan!',
    players: '8–16 bata (2 koponan)', props: 'Dalawang "base" (puno, poste o bilog na tisa) na magkalayo',
    real: [
      'May <b>base</b> ang bawat koponan. Magkalayo ang mga base, at may linya sa gitna ng dalawang teritoryo.',
      'Lalabas ang mga manlalaro para tayain ang kalaban. Ang <b>huling umalis</b> sa base ang puwedeng tumaya sa naunang umalis.',
      'Ang natayang manlalaro ay mapupunta sa <b>kulungan</b> sa tabi ng base ng kalaban. Puwede siyang iligtas ng kakampi sa pamamagitan ng paghawak sa kanya nang hindi natataya.',
      'Panalo ka kapag nahawakan mo ang base ng kalaban o nabilanggo mo ang lahat ng kalaban.'],
    how: [
      'Ikaw ang tumatakbong naka-kahel na damit. Gamitin ang mga arrow para tumakbo papunta sa pulang base 🚩 sa kanan.',
      'Hahabulin ka ng mga batang pula ang damit PERO sa panig lang nila (ang pulang kalahati).',
      'Kapag nahuli ka, mapupunta ka sa kulungan 🔒. Pindutin ang "Tawagin ang kaibigan" at ililigtas ka ng kakampi mo!'],
    tip: 'Gumamit ng puno o dalawang balde bilang base. Para sa maliliit na bata, tayahan at kulungan lang ang gawin at huwag munang sundin ang "huling umalis".' },
  langit: {
    tag: 'Manatili sa mataas na lugar para hindi matayaan!',
    players: '4–12 bata', props: 'Hagdan, bato, bangko, o anumang mataas sa lupa',
    real: [
      'Isa ang <b>Taya</b>. Ang iba ay nasa paligid ng matataas na lugar gaya ng hagdan, bato o bangko.',
      'Ang <b>langit</b> ay ang nakataas na lugar — ligtas ka kapag nakatayo ka rito. Ang <b>lupa</b> ay ang patag na lupa.',
      'Palipat-lipat ng puwesto ang mga manlalaro, at hahabulin ng Taya ang sinumang nasa lupa.',
      'Kapag natayaan ka sa lupa, <b>ikaw</b> na ang susunod na Taya!'],
    how: [
      'Gamitin ang mga arrow. Ang kayumangging 🪨 ay <b>Langit</b> — ligtas ka rito (may ✅).',
      'Kolektahin ang 3 ⭐ na nasa lupa. Ang batang naka-pulang damit ang Taya at hahabulin ka sa lupa!',
      'Kapag natayaan ka, ikaw naman ang Taya! Habulin ang kaibigan mo para matayaan siya.'],
    tip: 'Dapat bahagyang nakataas ang ligtas na lugar. Magdagdag ng patakarang hanggang bilang na 5 lang puwedeng tumayo sa langit para lagi silang gumagalaw!' },
  taguan: {
    tag: 'Ang Pilipinong bersyon ng hide-and-seek!',
    players: '3 o higit pang bata', props: 'Isang "base" (puno o pader) at magagandang taguan',
    real: [
      'Isa ang <b>Taya</b> (taga-hanap). Tatakpan niya ang mata sa <b>base</b> at magbibilang nang malakas — "Isa, dalawa, tatlo…"',
      'Tatakbo ang lahat para magtago. Madalas itong nilalaro sa dapithapon o sa liwanag ng buwan, may kantang: "Tagu-taguan, maliwanag ang buwan…"',
      'Pagkatapos magbilang, sisigaw ang Taya na hahanapin na niya sila.',
      'Kapag nakita ng Taya ang isa, tatakbo siya pabalik sa base at sisigaw ng <b>"Pung!"</b> kasama ang pangalan habang hinahawakan ang base. Kung maunang makarating sa base ang nagtago, ligtas siya!'],
    how: [
      'Panoorin ang pagbibilang: isa… hanggang sampu! Ikaw ang taga-hanap.',
      'Pumili ng lugar: baryo, gubat, palaruan, paaralan o dalampasigan. 3 kaibigan ang nagtatago roon. Pindutin ang taguan para silipin ito.',
      'Kapag may nakita kang kaibigan, pindutin ang malaking <b>PUNG!</b> para mahuli siya.'],
    tip: 'Magkasundo muna sa mga hangganan bago maglaro. Para sa maliliit na bata, magtago sa madaling makitang lugar at hanggang 10 lang ang bilang para masaya at hindi nakakatakot.' },
  araw: {
    tag: 'Magtago sa lilim — iwasan ang araw!',
    players: '4–12 bata', props: 'Maaraw na bakuran na may lilim ng puno o pader',
    real: [
      'Isa ang <b>Taya</b>. Ang iba ay nagsisikap manatili sa <b>lilim</b> kung saan hindi sila matatayaan.',
      'Ang sinumang nasa <b>araw</b> (tirik na sikat ng araw) ay puwedeng tayain.',
      'Gumagalaw ang araw sa langit kaya gumagalaw rin ang anino — kailangang maghanap ng bagong lilim!',
      'Ang natayang manlalaro ang bagong Taya.'],
    how: [
      'Ang madilim na berdeng kahon ay <b>lilim</b>. Tumayo rito para ligtas ✅.',
      'Tingnan ang ☀️ bar: kapag gumalaw ang araw, gumagalaw rin ang anino!',
      'Kolektahin ang 3 ⭐ sa ilalim ng araw. Ang batang naka-pulang damit ang Taya. Kapag natayaan ka, ikaw ang hahabol sa kaibigan mo!'],
    tip: 'Maglaro sa maaraw na umaga o hapon. Tanungin ang bata kung saan kaya mapupunta ang anino mamaya — masayang paraan para matuto tungkol sa araw!' },
  lawin: {
    tag: 'Ipagtatanggol ni Inahin ang mga sisiw laban sa Lawin!',
    players: '5–10 bata', props: 'Bukas na espasyo',
    real: [
      'Isang manlalaro ang <b>Lawin</b>, isa ang <b>Inahin</b>, at ang iba ay mga <b>Sisiw</b>.',
      'Pipila ang mga sisiw sa likod ng inahin, nakahawak sa baywang ng nasa harap.',
      'Hihingi ang lawin ng isang sisiw sa inahin. Tatanggi ang inahin, at susubukan ng lawin na hawakan ang <b>pinakahuling sisiw</b> sa pila.',
      'Ibubuka ng inahin ang kanyang mga braso at gagalaw pakaliwa at pakanan para harangan ang lawin. Sasabay sa pag-indak ang mga sisiw. Ang natayang sisiw ay sasama sa lawin!'],
    how: [
      'Ikaw ang Inahin. Nakasunod sa iyo ang 3 sisiw na magkakahawak.',
      'Tatakbo ang lawin (kayumangging damit) sa itaas at saka <b>sasalakay</b> pababa sa isang hanay.',
      'Kumilos pakaliwa at pakanan para mapunta sa ilalim ng lawin — kapag nahadlangan mo ito, ligtas ang mga sisiw! Humarang ng 7 salakay.'],
    tip: 'Dapat mahigpit (pero maingat!) ang kapit ng mga sisiw at sumabay ang inahin sa galaw ng lawin. Magsimula sa mabagal para masabayan ng maliliit.' },
  bakod: {
    tag: 'Humawak sa bakod at ligtas ka!',
    players: '4–10 bata', props: 'Bakod, poste, pader o puno',
    real: [
      'Isa ang <b>Taya</b>. Tatakbo sa bakuran ang lahat.',
      'Ang <b>kapit</b> ay paghawak at ang <b>bakod</b> ay harang. Basta nakahawak ka sa bakod, poste o pader, ligtas ka.',
      'Hindi ka puwedeng manatili sa iisang bakod nang matagal — magbibilang ang Taya at kailangan mong lumipat sa iba!',
      'Kapag natayaan ka nang hindi nakahawak sa anuman, ikaw na ang susunod na Taya.'],
    how: [
      'Ang mga 🪵 troso ang bakod. Ang dilaw na kahon ay nakahawak sa bakod — ligtas ka rito ✅.',
      'Kolektahin ang 3 ⭐ na malayo sa bakod. Ang batang naka-pulang damit ang Taya!',
      'Kapag natayaan ka, ikaw na ang Taya — habulin ang kaibigan mo!'],
    tip: 'Pumili ng ilang bakod o poste para palipat-lipat ang mga bata. Gumawa ng patakaran: 5 segundo lang sa iisang bakod!' },
  tinik: {
    tag: 'Talunin ang "tinik" na gawa sa magkapatong na kamay!',
    players: '3 o higit pang bata', props: 'Mga kamay at paa lang!',
    real: [
      'Dalawang manlalaro ang nakaupo sa lupa nang magkaharap, magkadikit ang talampakan. Ito ang unang "tinik".',
      'Magpapatong-patong sila ng kamay, isa sa ibabaw ng isa, para tumaas ang tinik — bawat antas ay isang <b>dangkal</b>.',
      'Ang ibang manlalaro ay salitang tatakbo at tatalon sa ibabaw ng tinik <b>nang hindi ito nahahawakan</b>.',
      'Kapag nasagi mo ito, ikaw ang papalit sa nakaupo!'],
    how: [
      'Panoorin ang 🔴 marka na dumudulas sa bar.',
      'Pindutin ang <b>Talon!</b> kapag lampas na ng berdeng ✅ linya ang marka — sapat na ang taas!',
      'Tumataas ang tinik sa bawat antas 🦶✋✋. Lampasan ang 5 antas!'],
    tip: 'Magsimula sa mga paa lang, saka magdagdag ng isang kamay bawat beses. Palaging umalalay sa mga nakaupo: banayad na talon lang, at mas maganda sa malambot na damuhan.' },
  baka: {
    tag: 'Talunin ang yumuyukong baka!',
    players: '3 o higit pang bata', props: 'Malambot at madamong lugar',
    real: [
      'Isa ang <b>baka</b>. Sa umpisa, nakayuko siya nang mababa, nakapatong ang kamay sa lupa at nakatago ang ulo.',
      'Ang ibang manlalaro ay tatakbo at lulundag sa likod ng baka, parang leap-frog, nang hindi nahahawakan ang ulo nito.',
      'Pagkatapos ng bawat ikot, tumataas ang baka: kamay sa paa, saka sa tuhod, saka sa hita.',
      'Kapag may nakasagi sa baka o nadapa, siya na ang susunod na baka!'],
    how: [
      'Pindutin at I-HOLD ang pindutan ng talon — pupuno ang bar ng lakas!',
      'Bitawan kapag lampas na sa berdeng ✅ linya para sapat ang taas ng talon.',
      'Palaki nang palaki ang yumuyukong kaibigan mo sa bawat antas. Lampasan ang 4 na antas!'],
    tip: 'Dapat nakatago ang ulo ng baka at tuwid ang likod. Turuan ang mga bata na tumakbo muna, saka tumulak gamit ang dalawang paa.' },
  garter: {
    tag: 'Lumundag sa mga ayos sa ibabaw ng goma!',
    players: '3 o higit pang bata', props: 'Mahabang goma (mga 3–4 metro) na nakatali nang pabilog',
    real: [
      'Dalawang manlalaro ang magkalayong nakatayo, hawak ang mahabang goma sa kanilang bukong-bukong. Nasa gitna ang tatalon, sa pagitan ng dalawang hibla.',
      'Gagawa ang tatalon ng ayos ng mga hakbang at talon (tatapak sa goma, lulundag sa gilid, saka tatalon sa ibabaw).',
      'Pagkatapos ng bawat ikot, tataas ang goma: <b>bukong-bukong → tuhod → baywang → dibdib → leeg → ulo → sa ibabaw ng ulo</b>!',
      'Kapag nagkamali ka o mali ang tapak, ikaw naman ang hahawak ng goma.'],
    how: [
      'Nagsisimula ang goma sa bukong-bukong. Sundan ang ayos ng mga kahon sa screen.',
      'Pindutin ang 🦶 Kaliwa, 🦶 Kanan o ⬆️ Talon ayon sa pagkakasunod ng mga kahon.',
      'Kapag nagkamali, ulitin ang ayos. Tataas ang goma pagkatapos ng bawat ayos!'],
    tip: 'Gumawa ng pabilog na goma mula sa magkakabuhol na rubber band. Gustong-gusto ng mga bata ang pag-awit habang tumatalon — nakakatulong ito para matandaan ang ayos!' },
  piko: {
    tag: 'Hopscotch ng mga Pilipino — hop, hop, pahinga!',
    players: '2–6 bata', props: 'Tisa (o patpat) at patag na bato na tinatawag na "maru"',
    real: [
      'Gumuhit ng malaking grid sa lupa na may mga numerong kahon at kalahating bilog sa dulo na tinatawag na <b>Langit</b>.',
      'Ihagis ang patag mong bato (<b>maru</b>) sa kahon bilang 1. Saka lumundag sa mga kahon: <b>isang paa</b> sa solong kahon at <b>dalawang paa</b> sa magkatabing kahon. Laktawan ang kahong may bato!',
      'Sa Langit, puwede kang magpahinga sa dalawang paa at umikot. Lumundag pabalik, yumuko at damputin ang bato.',
      'Saka ihagis sa kahon 2, at iba pa. Ang pagtapak sa linya o sa kahon ng bato ay tapos na ang turn mo.'],
    how: [
      'UNA, PINDUTIN ang kumikinang na kahon para ihagis ang 🪨 bato roon.',
      'Saka pindutin ang mga kumikinang na kahon nang sunud-sunod para lumundag: isang kahon = isang paa 🦶, dalawang magkatabing kahon = dalawang paa 🦶🦶.',
      'Laktawan ang kahon ng bato, magpahinga sa Langit 🌈, lumundag pabalik, at pindutin ang bato para damputin!'],
    tip: 'Gumuhit ng grid gamit ang tisa sa semento. Puwedeng dalawang paa muna sa bawat kahon ang maliliit na bata, saka pag-aralan ang isang paa.' },
  kadang: {
    tag: 'Karera sa mga bao ng niyog!',
    players: '2–6 bata', props: 'Kalahating bao ng niyog na may lubid na dumadaan sa bawat isa',
    real: [
      'Nakatayo ang bawat manlalaro sa dalawang kalahating bao ng niyog. May lubid na dumadaan sa butas ng bawat bao.',
      'Hawak mo nang mahigpit ang lubid at kinakapitan ng daliri ng paa ang bao.',
      'Humakbang nang <b>kaliwa, kanan, kaliwa, kanan</b> habang nagbabalanse, at tumakbo papunta sa finish line!',
      'Kapag nawalan ka ng balanse at nahulog, uulitin mo ang bahaging iyon.'],
    how: [
      'Hintayin ang "Takbo!" saka pindutin ang 🥥 Kaliwa at 🥥 Kanan <b>salitan</b>.',
      'Kapag pareho ang pinindot nang dalawang beses, hihiyaw ka at aatras!',
      'Makipagkarera sa dalawa mong kaibigan papunta sa 🏁 finish line.'],
    tip: 'Gumamit ng makapal na lubid at matibay na bao; magsimula sa damuhan. Bilangin nang malakas ang "kaliwa, kanan" para may ritmo!' },
  tumbang: {
    tag: 'Pabagsakin ang lata gamit ang tsinelas!',
    players: '4–10 bata', props: 'Walang lamang lata at tsinelas para sa bawat manlalaro',
    real: [
      'May lata (ang <b>preso</b>) na nakatayo sa maliit na bilog. Ang <b>Taya</b> ang nagbabantay rito.',
      'Nakatayo ang mga manlalaro sa likod ng linya at ihahagis ang kanilang <b>tsinelas</b> para mabuwal ang lata.',
      'Kapag natumba ang lata, tatakbo ang lahat para kunin ang tsinelas habang itinatayo ulit ng Taya ang lata.',
      'Puwedeng tayain ng Taya ang sinumang malayo sa kanyang tsinelas — ang natayaan ang magiging susunod na Taya!'],
    how: [
      'Panoorin ang 🔴 marka sa bar. Pindutin ang <b>Hagis!</b> kapag nasa berdeng bahagi ito para ihagis!',
      'Kung natumba ang lata: pindutin nang mabilis ang <b>Takbo!</b> para makuha ang tsinelas bago maitayo ng Taya ang lata.',
      '3 hagis ang mayroon ka. Subukang makuha ang tsinelas sa bawat beses!'],
    tip: 'Maglaro sa malambot na lupa, tumira nang mababa, at ihagis nang pailalim. Hindi dapat masyadong malapit ang Taya — gawing patas para sa maliliit.' },
  sipa: {
    tag: 'Panatilihing nasa ere ang sipa — bawal ang kamay!',
    players: '1 o higit pang bata', props: 'Sipa (washer na may plastik na hibla) o magaan na bola',
    real: [
      'Ang <b>sipa</b> ay washer na may makukulay na plastik na tali kaya dahan-dahan itong bumabagsak.',
      'Ihagis ito pataas at sipain gamit ang loob ng paa, tuhod, o siko para hindi bumagsak.',
      'Bawal na bawal ang <b>kamay</b>! Bilangin kung ilang sipa ang nagawa mo nang sunud-sunod.',
      'Ang sipa ang tradisyonal na pambansang laro ng Pilipinas. Puwedeng mag-isa o ipasa sa mga kasama sa bilog.'],
    how: [
      'Panoorin ang pagbagsak ng sipa. Kapag nasa dilaw na bahagi na, pindutin ang bahagi ng katawan na hinihingi ng hint!',
      'Paa 🦶, tuhod 🦵 o siko 💪 — bawal ang kamay.',
      'Gumawa ng 8 sipa! May 3 buhay ka (💛). Kapag dumikit sa lupa ang sipa, mababawasan ka ng isa.'],
    tip: 'Gumawa ng sipa mula sa washer at ilang piraso ng plastik na supot. Magsimula sa mababang sipa malapit sa lupa.' },
  tsato: {
    tag: 'Pitikin ang maliit na patpat at paluin nang malayo!',
    players: '2–6 bata', props: 'Isang mahabang patpat at isang maikling patpat (gaya ng hawakan ng walis na hinati)',
    real: [
      'Dalawang patpat ang gamit: mahaba para sa pagpalo at maikli na lumilipad. Ipatong ang maikling patpat sa maliit na butas o bato.',
      'Tapikin ang dulo nito gamit ang mahabang patpat para <b>tumalbog pataas</b> sa ere.',
      'Habang nasa ere, ipalo ang mahabang patpat at paluin ito nang pinakamalayo!',
      'Sukatin kung gaano kalayo ang narating gamit ang haba ng mahabang patpat. Pinakamarami ang puntos ng pinakamalayo.'],
    how: [
      'Pindutin ang <b>Tuklap!</b> para tumalbog pataas ang maikling patpat.',
      'Pindutin ang <b>Palo!</b> kapag nasa loob ng berdeng kahon na may guhit ang patpat — ang perpektong palo ang pinakamalayo!',
      '3 palo ang mayroon ka. Bilangin kung ilang haba ng patpat ang kabuuang puntos mo!'],
    tip: 'Kuskusin ang mga patpat para walang tinik. Maglaro sa bukas na bukid na malayo sa ibang bata at bintana, at sukatin gamit ang mahabang patpat.' },
  holen: {
    tag: 'Pitikin ang holen at ilabas ang iba sa bilog!',
    players: '2–5 bata', props: 'Mga holen at tisa para gumuhit ng bilog',
    real: [
      'Gumuhit ng bilog sa lupa at maglagay ng ilang holen sa loob.',
      'May mas malaking "pang-tira" na holen ang bawat manlalaro. Lumuhod sa likod ng linya at pitikin ito gamit ang hinlalaki.',
      'Tamaan ang mga holen sa bilog at ilabas ang mga ito — sa iyo na ang bawat holen na mailabas mo!',
      'Isa pang bersyon ay gumagamit ng maliliit na butas sa lupa: igulong ang holen mo sa mga butas nang sunud-sunod.'],
    how: [
      'Idiin ang daliri sa screen, <b>hilahin pabalik</b> na parang tirador, saka bitawan para pitikin ang asul mong 🔵 holen.',
      'Ilabas sa bilog ang 3 makukulay na holen!',
      '6 na tira ang mayroon ka. Mas kaunting tira, mas maraming bituin.'],
    tip: 'Maglaro sa patag at makinis na lupa. Ilayo ang mga holen sa mga sanggol at paslit na maaaring isubo ang mga ito. Bilangin ang mga holen bago at pagkatapos maglaro!' },
  palosebo: {
    tag: 'Akyatin ang madulas na poste para makuha ang premyo!',
    players: 'Mga koponang may 3–5 bata', props: 'Mataas na poste ng kawayan na pinahiran ng sebo — laro ito sa pista para sa matatanda at malalaking bata!',
    real: [
      'May matayog na poste ng kawayan na nakatayo sa lupa at pinahiran ng <b>sebo</b> (madulas na grasa). May bandila o premyo sa tuktok.',
      'Susubukang umakyat ng mga manlalaro, pero napakadulas — paulit-ulit silang dumudulas pababa!',
      'Gumagamit ang mga koponan ng buhangin o abo sa kamay para kumapit, at bumubuo ang magkakaibigan ng <b>tao-tao na hagdan o piramide</b> para umabot sa taas.',
      'Nilalaro ito sa mga pista ng bayan, at nagchi-cheer ang buong madla!'],
    how: [
      'Pindutin nang paulit-ulit ang <b>Akyat!</b> para umakyat. Dudulas ka dahil sa sebo!',
      'Pindutin ang 🏖️ <b>Buhangin</b> para magpahid ng buhangin sa kamay (mas kaunting dulas sa ilang sandali).',
      'Pindutin nang minsan ang 👫 <b>Kaibigan</b> para buhatin ka ng mga kaibigan mo! Abutin ang 🚩 sa tuktok!'],
    tip: 'Sa totoong buhay, mga mas malalaking bata lang na may bantay na matanda ang dapat sumubok. Sa bahay, laruin ito bilang "kunwaring pag-akyat" sa malambot na lubid o play-gym na dingding.' },
  sungka: {
    tag: 'Ipamahagi ang mga sigay at punuin ang bahay mo!',
    players: '2 manlalaro', props: 'Tabla ng sungka (o lalagyan ng itlog!) at 98 sigay, buto o maliliit na bato',
    real: [
      'May inukit na kahoy na tabla na may dalawang hanay ng <b>7 maliliit na lubak</b> at isang malaking <b>bahay</b> sa bawat dulo. May 7 sigay ang bawat maliit na lubak sa simula.',
      'Sa turn mo, kukunin mo ang lahat ng sigay sa isang lubak at isa-isa itong ilalagay sa mga susunod na lubak papunta sa sarili mong bahay.',
      'Kapag sa sarili mong bahay bumagsak ang huling sigay, may isa ka pang turn. Kapag sa lubak na may laman, kunin ang laman at ituloy ang pagbibigay!',
      'Kung sa walang lamang lubak sa panig mo bumagsak ang huling sigay, makukuha mo ang mga sigay sa katapat nito. Panalo ang may pinakamaraming sigay sa bahay!'],
    how: [
      'Ikaw ang nasa ibabang hanay (may asul na kinang). Pindutin ang isang lubak mo para kunin at ipamahagi ang mga sigay 🐚 pakanan.',
      'Huling sigay sa 🏠 bahay mo (kanan) = dagdag na turn! Huling sigay sa lubak na may laman = tuloy lang. Huling sigay sa walang lamang lubak mo = kunin ang katapat!',
      'Kapag naubos ang sigay sa isang panig, tapos na ang laro. Ang may pinakamaraming sigay sa bahay ang panalo!'],
    tip: 'Gumawa ng tabla mula sa egg carton at dalawang mangkok. Mahusay na pagsasanay sa pagbibilang at pagdaragdag ang pagbibilang ng sigay. (Salitan ang turn sa bersyong ito, mas madali kaysa sa totoong laro na sabay ang unang galaw.)' },
  dama: {
    tag: 'Checkers ng mga Pilipino gamit ang takip ng bote!',
    players: '2 manlalaro', props: 'Checkerboard na iginuhit sa karton at 24 takip ng bote (dalawang kulay)',
    real: [
      'Nilalaro ang dama sa 8×8 na tabla gamit lang ang madidilim na kahon. May <b>12 piyesa</b> ang bawat manlalaro — kadalasan ay takip ng bote, bato o kahoy.',
      'Isang hakbang na <b>pahilis paharap</b> ang galaw ng piyesa papunta sa walang lamang kahon.',
      'Para manakop, lumundag nang pahilis sa ibabaw ng kalabang piyesa papunta sa walang lamang kahon sa likod nito. Kapag may puwedeng sakupin, <b>kailangan</b> mo itong gawin!',
      'Ang piyesang nakarating sa kabilang dulo ay nagiging <b>dama</b> (hari) at puwedeng gumalaw pasulong at paatras. Panalo ka kapag naubos mo ang kalaban!'],
    how: [
      'Ikaw ang asul na takip 🔵 sa ibaba at ikaw ang unang gagalaw. Pindutin ang isang takip, saka ang berdeng tuldok para gumalaw.',
      'Lundagan ang pulang takip para mahuli ito. Kapag may puwedeng mahuli, kailangan mo itong gawin (kumikislap ang mga takip).',
      'Abutin ang itaas na hanay para maging hari 👑!'],
    tip: 'Gumawa ng tabla mula sa karton at gumamit ng dalawang uri ng takip ng bote. Hayaang 6 na piyesa lang muna ang bawat isa para matutunan ang mga galaw.' }
};

/* ---------- in-game messages: exact English -> Tagalog ---------- */
const D = {
  /* patintero / agawan / chase games */
  'Tagged! 😅 Back to start — try again!': 'Natayaan! 😅 Balik sa simula — subukan ulit!',
  '⭐ You crossed! Now run back home 🏠!': '⭐ Nakatawid ka! Takbo pabalik sa 🏠!',
  'You crossed every line and came back safely!': 'Natawid mo ang lahat ng linya at nakabalik ka nang ligtas!',
  'Run to the ⭐ side! Dodge the taggers on the lines.': 'Takbo papunta sa ⭐! Iwasan ang mga taya sa mga linya.',
  'You captured the red base! 🚩': 'Nakuha mo ang pulang base! 🚩',
  'Oh no, you\'re in jail! 🔒 Call a friend to free you!': 'Naku, nasa kulungan ka! 🔒 Tawagin ang kaibigan para iligtas ka!',
  'Your friend is running to rescue you! 🏃': 'Tumatakbo ang kaibigan mo para iligtas ka! 🏃',
  'You\'re free! Run to the 🚩 flag!': 'Laya ka na! Takbo sa 🚩 bandila!',
  'Run to the red 🚩 flag! Watch out for the red team.': 'Takbo papunta sa pulang 🚩 bandila! Mag-ingat sa pulang koponan.',
  'Tag! They\'re "It" again. Collect the ⭐ stars!': 'Taya! Sila na ulit ang Taya. Kolektahin ang mga ⭐!',
  'Your friend got tired. Back to collecting ⭐!': 'Napagod ang kaibigan mo. Balik sa pagkolekta ng ⭐!',
  '🙋 Call a friend!': '🙋 Tawagin ang kaibigan!',
  'Stand on 🪨 (langit) to be safe. Collect 3 ⭐ from the ground!': 'Tumayo sa 🪨 (langit) para ligtas. Kolektahin ang 3 ⭐ sa lupa!',
  'Tagged on the lupa! Now YOU are It — tag your friend!': 'Natayaan sa lupa! Ikaw na ang Taya — tayain ang kaibigan mo!',
  'You collected all the stars on the lupa!': 'Nakolekta mo ang lahat ng bituin sa lupa!',
  'Dark green = shade (safe). Collect 3 ⭐ — and watch the ☀️!': 'Madilim na berde = lilim (ligtas). Kolektahin ang 3 ⭐ — at bantayan ang ☀️!',
  'Tagged in the sunshine! Now YOU are It — tag your friend!': 'Natayaan sa araw! Ikaw na ang Taya — tayain ang kaibigan mo!',
  'You played tag in the sun and the shade!': 'Naglaro ka ng habulan sa araw at lilim!',
  '☀️ The sun moved! The shadows moved too!': '☀️ Gumalaw ang araw! Gumalaw rin ang mga anino!',
  'Yellow squares touch the fence — safe! Collect 3 ⭐.': 'Ang dilaw na kahon ay nakahawak sa bakod — ligtas! Kolektahin ang 3 ⭐.',
  'Tagged away from the fence! Now YOU are It — tag your friend!': 'Natayaan nang malayo sa bakod! Ikaw na ang Taya — tayain ang kaibigan mo!',
  'You are a fence-hugging champion!': 'Ikaw ang kampeon ng kapit-bakod!',
  /* taguan */
  'Found you! 👀 Quick — tap PUNG!': 'Nakita kita! 👀 Dali — pindutin ang PUNG!',
  'Nobody here! Try another spot.': 'Walang tao rito! Subukan ang iba.',
  'You found all your friends! Pung! Pung! Pung!': 'Nakita mo ang lahat ng kaibigan mo! Pung! Pung! Pung!',
  'Close your eyes and count with me!': 'Pumikit at magbilang kasama ko!',
  'Ready or not, here I come! Tap a place to look. 🔍': 'Handa na ba kayo? Ayan na ako! Pindutin ang taguan para silipin. 🔍',
  'Eyes closed…': 'Nakapikit…',
  'Here I come!': 'Ayan na ako!',
  /* lawin */
  'Stay under the hawk to protect your chicks!': 'Manatili sa ilalim ng lawin para maprotektahan ang mga sisiw!',
  'Blocked! Good job, Inahin!': 'Nahadlangan! Magaling, Inahin!',
  'Oh no! The hawk tagged a chick. Stay closer!': 'Naku! Natayaan ng lawin ang isang sisiw. Lumapit ka pa!',
  'Nice try, Inahin! Play again to save them all.': 'Magaling na subok, Inahin! Ulitin para maligtas silang lahat.',
  /* jumping games */
  'Wow! You jumped over it! 🎉': 'Wow! Natalon mo ito! 🎉',
  'Tap Talon! when the marker is past the green line.': 'Pindutin ang Talon! kapag lampas na sa berdeng linya ang marka.',
  'Oops! You touched the tinik. Try again! 🌵': 'Ay! Nasagi mo ang tinik. Subukan ulit! 🌵',
  'You jumped over every tinik without touching it!': 'Natalon mo ang bawat tinik nang hindi ito nasasagi!',
  'Hold the button, let go past the green line!': 'I-hold ang pindutan, bitawan kapag lampas na sa berdeng linya!',
  'Oops! You bumped the baka. Hold a little longer! 🐄': 'Ay! Nasagi mo ang baka. Mas matagal na pag-hold! 🐄',
  'You leaped over the baka at every height!': 'Nalundagan mo ang baka sa lahat ng taas!',
  '🦘 Hold… then let go!': '🦘 I-hold… saka bitawan!',
  'Paa (feet)': 'Paa', 'Tuhod (knee)': 'Tuhod', 'Baywang (waist)': 'Baywang', 'Dibdib (chest)': 'Dibdib', 'Balikat (shoulder)': 'Balikat',
  'Mababa (low)': 'Mababa', 'Katamtaman (medium)': 'Katamtaman', 'Mataas (high)': 'Mataas', 'Napakataas (very high)': 'Napakataas',
  'Ankle (bukong-bukong)': 'Bukong-bukong', 'Knee (tuhod)': 'Tuhod', 'Waist (baywang)': 'Baywang', 'Chest (dibdib)': 'Dibdib', 'Head (ulo)': 'Ulo',
  'Copy the pattern: tap the buttons in order!': 'Gayahin ang ayos: pindutin ang mga pindutan nang sunud-sunod!',
  'Super! The rope goes higher! 🎀': 'Ang galing! Tumataas ang goma! 🎀',
  'You cleared every height of Chinese Garter!': 'Nalampasan mo ang lahat ng taas ng Chinese Garter!',
  'Oops! Start the pattern again. 😅': 'Ay! Ulitin ang ayos. 😅',
  '⬅️ Left': '⬅️ Kaliwa', 'Right ➡️': 'Kanan ➡️', '🥥 Left': '🥥 Kaliwa', 'Right 🥥': 'Kanan 🥥',
  'Great! Now a new throw. 🪨': 'Magaling! Bagong hagis naman. 🪨',
  'You hopped all the way through Piko!': 'Nalundagan mo ang buong Piko!',
  'Rest in Langit 🌈! Tap it, then turn around.': 'Magpahinga sa Langit 🌈! Pindutin ito, saka umikot.',
  'Bend down and pick up your stone 🪨!': 'Yumuko at damputin ang bato mo 🪨!',
  'You won the race! 🥇': 'Panalo ka sa karera! 🥇',
  'You finished the race! 🏁': 'Natapos mo ang karera! 🏁',
  'Wobble! Alternate: left, right, left, right!': 'Nayanig! Salitan: kaliwa, kanan, kaliwa, kanan!',
  'Get ready…': 'Humanda…',
  'TAKBO! Tap left, right, left, right! 🥥': 'TAKBO! Pindutin ang kaliwa, kanan, kaliwa, kanan! 🥥',
  /* tumbang preso */
  'Tap Hagis! when the marker is in the green zone!': 'Pindutin ang Hagis! kapag nasa berdeng bahagi ang marka!',
  'TUMBANG! 🥫 Run, run! Tap Takbo! as fast as you can!': 'TUMBANG! 🥫 Takbo, takbo! Pindutin nang mabilis ang Takbo!',
  'Mintis! Missed — the can is still standing.': 'Mintis! Hindi tinamaan — nakatayo pa rin ang lata.',
  'Natayaan! 😅 Taya tagged you. Try again!': 'Natayaan! 😅 Tinaya ka ng Taya. Subukan ulit!',
  'Nakuha mo ang tsinelas! 🩴 You are safe!': 'Nakuha mo ang tsinelas! 🩴 Ligtas ka na!',
  'Nice throws! Try again to rescue your slipper.': 'Magagaling na hagis! Subukan ulit para makuha ang tsinelas.',
  '🏃 You: tap Takbo!': '🏃 Ikaw: pindutin ang Takbo!',
  '🥫 Taya sets the can up': '🥫 Itinatayo ng Taya ang lata',
  /* sipa */
  'Oops! It touched the ground. Try again!': 'Ay! Dumikit sa lupa. Subukan ulit!',
  'Wait for the yellow zone! ⏳': 'Hintayin ang dilaw na bahagi! ⏳',
  'Good try! Keep practising your sipa kicks.': 'Magaling na subok! Magsanay pa sa pagsipa.',
  '🦶 Foot': '🦶 Paa', '🦵 Knee': '🦵 Tuhod', '💪 Elbow': '💪 Siko',
  'Kicks:': 'Sipa:',
  /* tsato */
  'Missed! The stick fell down. 😅': 'Mintis! Nahulog ang patpat. 😅',
  'Now tap Palo! when it is in the green box!': 'Pindutin ang Palo! kapag nasa berdeng kahon ang patpat!',
  'Total:': 'Kabuuan:', 'stick-lengths': 'haba ng patpat',
  /* holen */
  'Pull back like a slingshot, then let go! 🔵': 'Hilahin pabalik na parang tirador, saka bitawan! 🔵',
  'Labas! 🎉 One marble out!': 'Labas! 🎉 Isang holen ang nailabas!',
  'Out:': 'Labas:', '/3 · Shots left:': '/3 · Natitirang tira:',
  /* palosebo */
  'Your friends lifted you up! 👫': 'Binuhat ka ng mga kaibigan mo! 👫',
  'Tap Akyat! again and again to climb! The grease makes you slip!': 'Pindutin nang paulit-ulit ang Akyat! Madulas ang sebo!',
  '🧈 Slippery!': '🧈 Madulas!', '🏖️ Sandy grip!': '🏖️ May kapit!', 'Height:': 'Taas:',
  /* sungka */
  '👴 Last shell in Lolo\'s house — another turn!': '👴 Sa bahay ni Lolo bumagsak ang huling sigay — isa pang turn!',
  'Last shell in YOUR bahay! Go again! 🎉': 'Sa BAHAY MO bumagsak ang huling sigay! Ulit! 🎉',
  'Pit had shells — keep sowing! 🐚': 'May laman ang lubak — ituloy ang pamamahagi! 🐚',
  'Tap one of your pits (bottom row) to sow the shells!': 'Pindutin ang isa sa mga lubak mo (ibabang hanay) para ipamahagi ang mga sigay!',
  '👇 Your turn!': '👇 Ikaw naman!', '👴 Lolo is thinking…': '👴 Nag-iisip si Lolo…', '🏠 You': '🏠 Ikaw',
  /* dama */
  'You captured the red caps! Panalo! 🏆': 'Nakuha mo ang lahat ng pulang takip! Panalo! 🏆',
  'Red won this time. Try again!': 'Nanalo ang pula ngayon. Subukan ulit!',
  'Jump again! 🦘': 'Lundag ulit! 🦘',
  'You must capture! Pick a pulsing cap.': 'Kailangan mong manakop! Pumili ng kumikislap na takip.',
  'Red left a cap to capture! Jump it! 🦘': 'May naiwang takip ang pula! Lundagan mo! 🦘',
  'You are blue 🔵. Tap a cap, then a green dot!': 'Ikaw ang asul 🔵. Pindutin ang takip, saka ang berdeng tuldok!',
  '👆 You must capture! Tap a pulsing cap.': '👆 Kailangan mong manakop! Pindutin ang kumikislap na takip.',
  '👆 Your turn! Tap a blue cap.': '👆 Ikaw naman! Pindutin ang asul na takip.',
  '🔴 Red is thinking…': '🔴 Nag-iisip ang pula…'
};
const BODY = { FOOT: 'PAA', KNEE: 'TUHOD', ELBOW: 'SIKO' };
const pl = s => s.replace(/ & /g, ' at ');
/* messages that contain numbers or names */
const DYN = [
  [/^Pung! ✅ (\d+) more to find…$/, n => `Pung! ✅ ${n} pa ang hahanapin…`],
  [/^You kept (\d+) chicks? safe!$/, n => `Naligtas mo ang ${n} sisiw!`],
  [/^Level (\d+)\/(\d+) · (.+)$/, (a, b, c) => `Antas ${a}/${b} · ${FZ.tr(c)}`],
  [/^Throw the stone 🪨 into box (.+): tap the glowing box!$/, x => `Ihagis ang bato 🪨 sa kahon ${pl(x)}: pindutin ang kumikinang na kahon!`],
  [/^Hop on ONE foot 🦶 → box (\d+)$/, n => `Lundag gamit ang ISANG paa 🦶 → kahon ${n}`],
  [/^Land on TWO feet 🦶🦶 → boxes (.+)$/, x => `Lumapag sa DALAWANG paa 🦶🦶 → kahon ${pl(x)}`],
  [/^Hop back on ONE foot 🦶 → box (\d+)$/, n => `Lundag pabalik gamit ang ISANG paa 🦶 → kahon ${n}`],
  [/^Hop back on TWO feet 🦶🦶 → boxes (.+)$/, x => `Lundag pabalik sa DALAWANG paa 🦶🦶 → kahon ${pl(x)}`],
  [/^You rescued your tsinelas (\d+) times?!$/, n => `Nakuha mo ang tsinelas mo nang ${n} beses!`],
  [/^Use your (FOOT|KNEE|ELBOW) (.+)! \(no hands ✋❌\)$/, (w, e) => `Gamitin ang iyong ${BODY[w]} ${e}! (bawal ang kamay ✋❌)`],
  [/^Not that one! Use your (FOOT|KNEE|ELBOW) (.+)!$/, (w, e) => `Hindi iyan! Gamitin ang iyong ${BODY[w]} ${e}!`],
  [/^You kicked the sipa (\d+) times without hands!$/, n => `Nasipa mo ang sipa nang ${n} beses nang walang kamay!`],
  [/^You scored (\d+) out of 4 points!$/, n => `Nakakuha ka ng ${n} sa 4 na puntos!`],
  [/^Sayang! It was finger (\d+)\. 😅$/, n => `Sayang! Daliri bilang ${n} iyon. 😅`],
  [/^Turn (\d+) of 3: tap Tuklap! to flip the stick\.$/, n => `Ika-${n} palo sa 3: pindutin ang Tuklap! para tumalbog ang patpat.`],
  [/^Ang layo! It flew (\d+) stick-lengths! 🎉$/, n => `Ang layo! Lumipad ito nang ${n} haba ng patpat! 🎉`],
  [/^You hit a total of (\d+) stick-lengths!$/, n => `Kabuuang ${n} haba ng patpat ang naabot mo!`],
  [/^You knocked (\d+) marbles out of the circle!$/, n => `Naipalabas mo ang ${n} holen sa bilog!`],
  [/^You knocked out (\d+) marbles\. Try again!$/, n => `Naipalabas mo ang ${n} holen. Subukan ulit!`],
  [/^You reached the flag in (\d+) seconds! 🚩$/, n => `Naabot mo ang bandila sa loob ng ${n} segundo! 🚩`],
  [/^Buhangin on your hands! 🏖️ \((\d+) left\)$/, n => `May buhangin na sa kamay mo! 🏖️ (${n} pa)`],
  [/^(.+) captured (\d+) shells!$/, (a, n) => `Nakuha ni ${a} ang ${n} sigay!`],
  [/^(.+) got another turn! 🎉$/, a => `${a} may isa pang turn! 🎉`],
  [/^(.+) is thinking…$/, a => `${a} nag-iisip…`],
  [/^👆 (.+)'s turn! \(top row\)$/, a => `👆 Turn ni ${a}! (hanay sa itaas)`],
  [/^You won (\d+) to (\d+)! 🏆$/, (a, b) => `Nanalo ka, ${a} kontra ${b}! 🏆`],
  [/^Take turns! Tap a pit on your side\.$/, () => 'Magpalitan! Pindutin ang lubak sa panig mo.'],
  [/^Pick your opponent! 👇$/, () => 'Pumili ng kalaban! 👇'],
  [/^You captured (\d+) shells! 🎉$/, n => `Nakuha mo ang ${n} sigay! 🎉`],
  [/^You won (\d+) to (\d+)! 🏆$/, (a, b) => `Panalo ka, ${a} kontra ${b}! 🏆`],
  [/^A tie, (\d+) to (\d+)!$/, (a, b) => `Tabla, ${a} kontra ${b}!`],
  [/^(.+) won (\d+) to (\d+)\. Play again!$/, (a, b, c) => `Nanalo si ${a}, ${b} kontra ${c}. Ulitin!`]
];
FZ.tr = s => {
  if (FZ.lang !== 'tl' || !s) return s;
  const k = String(s).trim(); if (!k) return s;
  if (D[k]) return String(s).replace(k, D[k]);
  for (const [re, fn] of DYN) { const m = k.match(re); if (m) return String(s).replace(k, fn(...m.slice(1))); }
  return s;
};
FZ._dict = D; FZ._dyn = DYN;

/* translate anything the games write on screen while Tagalog is on */
FZ.watchText = root => {
  const fix = n => { const v = FZ.tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; };
  const walk = el => { const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) fix(n); };
  new MutationObserver(ms => {
    if (FZ.lang !== 'tl') return;
    ms.forEach(m => {
      if (m.type === 'characterData') fix(m.target);
      else m.addedNodes.forEach(n => { if (n.nodeType === 3) fix(n); else if (n.nodeType === 1) walk(n); });
    });
  }).observe(root, { childList: true, subtree: true, characterData: true });
};


/* ---------- how the digital version differs from real life (one short note per game) ---------- */
FZ.DIGI = {
  patintero: { en: "On screen you move one square per tap, and guards take turns. In real life you race with your whole body and guards react as you run.", tl: "Sa screen, isang kahon bawat pindot ang galaw mo at sunod-sunod kumilos ang taya. Sa totoong laro, tumatakbo ka nang buo ang katawan at tumutugon ang taya habang tumatakbo ka." },
  agawan: { en: "The other team is computer-controlled. In real life players shout, plan together and rescue jailed friends by touching them.", tl: "Kontrolado ng computer ang kabilang koponan. Sa totoong laro, sumisigaw, nagpaplano nang sama-sama at nililigtas ng kakampi ang nakakulong sa pamamagitan ng pagdampi." },
  langit: { en: "Safe stones are shown on the grid. In real life you find your own raised places like steps, a bench or a rock.", tl: "Nakikita sa grid ang ligtas na bato. Sa totoong laro, ikaw mismo ang humahanap ng nakataas na lugar tulad ng hagdan, bangko o bato." },
  taguan: { en: "The seeker counting and the hiders are shown as spots. In real life you hide in real places and run to the base yourself.", tl: "Ang nagbibilang na taya at ang mga nagtatago ay nakikita bilang kahon. Sa totoong laro, ikaw mismo ang nagtatago sa totoong lugar at tumatakbo sa base." },
  araw: { en: "The sun moves along a bar. In real life you watch the real shadows and feel the heat.", tl: "Gumagalaw ang araw sa isang bar. Sa totoong laro, pinagmamasdan mo ang tunay na anino at ramdam ang init." },
  lawin: { en: "You only move left and right, and the hawk dives on screen. In real life the whole chain of chicks moves together, holding on.", tl: "Kaliwa at kanan lang ang galaw mo at sumisisid ang lawin sa screen. Sa totoong laro, sabay-sabay gumagalaw ang buong hanay ng sisiw na magkakahawak." },
  bakod: { en: "Safe fences are yellow squares. In real life you hold a real fence, post or wall.", tl: "Ang ligtas na bakod ay dilaw na kahon. Sa totoong laro, humahawak ka sa tunay na bakod, poste o pader." },
  tinik: { en: "A meter replaces your sense of balance: you tap at the right moment. In real life the thorn is stacked hands and feet that you must not touch.", tl: "Ang metro ang pumapalit sa pakiramdam ng balanse: pindutin sa tamang oras. Sa totoong laro, ang tinik ay mga nakasalansang kamay at paa na hindi dapat mahawakan." },
  baka: { en: "You hold a button to build power. In real life you judge the jump by looking at the bending friend's back.", tl: "Hawakan ang pindutan para mabuo ang lakas. Sa totoong laro, tinitingnan mo ang likod ng yumuyukong kaibigan para mahulaan ang talon." },
  garter: { en: "You copy a pattern of buttons. In real life you hop to a rhythm with your feet while the band rises.", tl: "Ginagaya mo ang ayos ng mga pindutan. Sa totoong laro, tumatalon ka sa saliw gamit ang paa habang tumataas ang goma." },
  piko: { en: "You tap boxes in order, and throwing the stone is a tap too. In real life you really throw the stone and balance on one foot.", tl: "Pindutin ang mga kahon nang sunod-sunod, at pagpindot din ang pagtapon ng bato. Sa totoong laro, talagang itinatapon mo ang bato at nagbabalanse sa isang paa." },
  kadang: { en: "Two taps make one step. In real life both legs and your balance do the work.", tl: "Dalawang pindot ang isang hakbang. Sa totoong laro, ang dalawang binti at balanse mo ang gumagawa ng lahat." },
  tumbang: { en: "Throwing is a timing tap on a bar, and Taya is on screen. In real life you really throw the slipper and run to grab it back.", tl: "Ang paghagis ay pagpindot sa tamang oras sa bar, at nasa screen ang taya. Sa totoong laro, talagang ihahagis ang tsinelas at tatakbo para kunin ito." },
  sipa: { en: "You tap the body part to use. In real life the sipa is kicked with your real foot, knee or elbow.", tl: "Pindutin ang bahagi ng katawan na gagamitin. Sa totoong laro, sisipain mo ang sipa gamit ang tunay mong paa, tuhod o siko." },
  tsato: { en: "Your tap timing decides the flight. In real life you swing the stick yourself and measure the distance.", tl: "Ang tamang oras ng pindot ang nagtatakda ng lipad. Sa totoong laro, ikaw mismo ang hahampas at susukatin ang layo." },
  holen: { en: "You drag back and let go on screen. In real life marbles roll on the ground and bump each other with real friction.", tl: "Hilahin pabalik at bitawan sa screen. Sa totoong laro, gumugulong ang holen sa lupa at nagbabanggaan nang totoo." },
  palosebo: { en: "Taps move you up and grease slows you on screen. In real life teams build human ladders and use real sand for grip.", tl: "Ang pindot ang nagpapaakyat sa iyo at pinabagal ka ng sebo sa screen. Sa totoong laro, bumubuo ng hagdan ng tao ang mga koponan at gumagamit ng buhangin para kumapit." },
  sungka: { en: "The computer plays your opponent, or a friend takes turns on this device. In real life you sit face to face with real shells.", tl: "Ang computer ang kalaban, o ang kaibigan mo ay nagpapalitan ng turn sa device na ito. Sa totoong laro, magkaharap kayo at tunay na sigay ang gamit." },
  dama: { en: "The computer makes its moves and highlights the captures you must make. In real life you spot forced captures yourself.", tl: "Ang computer ang gumagawa ng galaw at may ilaw ang mga pagkuha na kailangan mong gawin. Sa totoong laro, ikaw mismo ang dapat makakita ng sapilitang pagkuha." }
};
FZ.digi = id => { const e = FZ.DIGI[id]; return e ? (FZ.lang === 'tl' ? e.tl : e.en) : ''; };
