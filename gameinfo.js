'use strict';
/* =====================================================
   FunZone GAME INFO
   FZ.HIST   – "About this game": a short history, for the About page of each game (English + Tagalog)
   FZ.TRICKS – a tip that pops up the first time a child reaches a level with something new
               (at = level number - 1, so at: 10 is shown before Level 11)
   ===================================================== */
FZ.HIST = {
  patintero: {
    en: 'Patintero is one of the best-known Filipino street games. Its name is often linked to "tinta" (ink), because lines used to be marked on the ground; today children draw them with chalk, a stick or water. It is a favourite in streets and schoolyards, especially on cool evenings.',
    tl: 'Ang patintero ay isa sa pinakakilalang larong kalye sa Pilipinas. Madalas iugnay ang pangalan nito sa "tinta," dahil minamarkahan noon ang mga linya sa lupa; ngayon ay iginuguhit ito ng tisa, patpat o tubig. Paborito ito sa kalye at sa paaralan, lalo na sa malamig na gabi.' },
  agawan: {
    en: 'Agawan Base means "steal the base". Two teams each guard a base, such as a tree, post or pole, and try to touch the other team\'s base without being caught. Base-stealing games are played around the world, and Filipino children have played this one in schoolyards for generations.',
    tl: 'Ang ibig sabihin ng Agawan Base ay "agawan ng base." May sariling base ang bawat grupo, tulad ng puno, poste o haligi, at sinusubukan nilang mahawakan ang base ng kalaban nang hindi nahuhuli. Nilalaro ang ganitong laro sa buong mundo, at matagal na itong nilalaro ng mga batang Pilipino sa paaralan.' },
  langit: {
    en: 'Langit-Lupa means "heaven and earth". The taya can only tag players on the ground (lupa); anyone standing on something raised (langit) is safe, but only for a little while. Kids often pick the first taya by chanting "Langit, lupa, impyerno…" while pointing at each player.',
    tl: 'Ang ibig sabihin ng Langit-Lupa ay "langit at lupa." Ang mga nasa lupa lang ang puwedeng mataya; ligtas ang nakatayo sa mataas na lugar (langit), pero sandali lang. Madalas pinipili ang unang taya sa pagbigkas ng "Langit, lupa, impyerno…" habang itinuturo ang bawat manlalaro.' },
  taguan: {
    en: 'Taguan is the Filipino hide-and-seek. The taya counts with eyes closed while everyone hides, then looks for them and races back to the base shouting "Pung!" It is traditionally played at dusk, and many kids start it by singing "Tagu-taguan, maliwanag ang buwan".',
    tl: 'Ang taguan ay ang Pilipinong bersiyon ng hide-and-seek. Nagbibilang ang taya nang nakapikit habang nagtatago ang lahat, saka sila hahanapin at uunahan sa base sabay sigaw ng "Pung!" Karaniwan itong nilalaro sa dapithapon, at sinisimulan ng maraming bata sa pagkanta ng "Tagu-taguan, maliwanag ang buwan."' },
  araw: {
    en: 'Araw-Lilim means "sun and shade". Players are safe in the shade of trees and walls, but can be tagged in the sunshine. Because the sun moves, the shadows move too, so players must keep looking for new shade. It is a game for sunny afternoons in the yard.',
    tl: 'Ang ibig sabihin ng Araw-Lilim ay "araw at lilim." Ligtas ang mga manlalaro sa lilim ng puno at pader, pero puwede silang mataya sa sikat ng araw. Dahil gumagalaw ang araw, gumagalaw rin ang anino, kaya kailangang humanap ng bagong lilim. Larong pang-maaraw na hapon ito sa bakuran.' },
  lawin: {
    en: 'Lawin at Sisiw means "hawk and chicks". One child is the hawk, one is the mother hen, and the others line up behind her as chicks, holding each other\'s waists. The hen spreads her arms to protect them. Similar "hawk and chicken" games are played in many countries in Asia.',
    tl: 'Ang ibig sabihin ng Lawin at Sisiw ay "lawin at mga sisiw." Lawin ang isang bata, inahing manok ang isa, at nakapila sa likod nito ang mga sisiw na magkakahawak sa baywang. Iniuunat ng inahin ang mga braso para protektahan sila. May katulad na laro sa maraming bansa sa Asya.' },
  bakod: {
    en: 'Kapitang Bakod means "hold on to the fence". Anyone touching a fence, wall or post is safe from the taya, but players have to let go and run to another fence. It is a simple tag game that grew up in neighbourhoods full of fences and gates.',
    tl: 'Ang ibig sabihin ng Kapitang Bakod ay "kumapit sa bakod." Ligtas sa taya ang sinumang nakahawak sa bakod, pader o poste, pero kailangang bumitaw at tumakbo papunta sa ibang bakod. Simpleng larong habulan ito na nabuo sa mga lugar na maraming bakod at tarangkahan.' },
  tinik: {
    en: 'Luksong Tinik means "jump over the thorns". Two players sit facing each other and stack their feet and hands to make the "thorns", which grow taller every round. It is one of the classic laro ng lahi and is often played at school during Buwan ng Wika celebrations.',
    tl: 'Ang ibig sabihin ng Luksong Tinik ay "luksuhin ang tinik." Magkaharap na nakaupo ang dalawang manlalaro at pinagpapatong ang kanilang paa at kamay para maging "tinik," na tumataas bawat round. Isa ito sa mga paboritong larong Pinoy at madalas laruin sa paaralan tuwing Buwan ng Wika.' },
  baka: {
    en: 'Luksong Baka means "jump over the cow". One player, the "baka", bends over and stands a little taller after every round, while the others leap over using their hands. It is like leapfrog, which children play in many countries.',
    tl: 'Ang ibig sabihin ng Luksong Baka ay "luksuhin ang baka." Yumuyuko ang isang manlalaro, ang "baka," at tumataas nang kaunti bawat round, habang lumulukso ang iba gamit ang kanilang kamay. Kahawig ito ng leapfrog na nilalaro ng mga bata sa maraming bansa.' },
  garter: [{ at: 15, emoji: '🎀', en: 'The garter is above your waist now. Run up fast and jump HIGH!', tl: 'Lampas baywang na ang garter. Tumakbo nang mabilis at tumalon nang MATAAS!' }],
  piko: {
    en: 'Piko is the Filipino version of hopscotch. Hopscotch games are very old and are played all over the world. In Piko, the player throws a flat stone (pamato) into a box, hops through the grid on one or two feet, and rests in the "langit" at the end.',
    tl: 'Ang piko ay ang Pilipinong bersiyon ng hopscotch. Napakatanda na ng larong ito at nilalaro sa buong mundo. Sa piko, inihahagis ng manlalaro ang pamato sa isang kahon, lumulukso sa mga kahon gamit ang isa o dalawang paa, at nagpapahinga sa "langit" sa dulo.' },
  kadang: {
    en: 'Kadang-Kadang is a race on stilts. Children walk on tall bamboo stilts, or on coconut shells tied with string and held like reins. It is a popular race at town fiestas and school field days, and it trains balance and teamwork.',
    tl: 'Ang kadang-kadang ay karera gamit ang tayakad. Lumalakad ang mga bata sa matataas na kawayan, o sa bao ng niyog na may taling hawak na parang renda. Sikat ito sa mga pista at field day sa paaralan, at nagsasanay ito ng balanse at pagtutulungan.' },
  tumbang: {
    en: 'Tumbang Preso means "knock down the prisoner". Players throw their tsinelas (slippers) to knock over a tin can guarded by the taya, then run to get their slipper back before being tagged. It is famous because all you need is a can and your slippers.',
    tl: 'Ang ibig sabihin ng Tumbang Preso ay "patumbahin ang preso." Ibinabato ng mga manlalaro ang kanilang tsinelas para patumbahin ang lata na binabantayan ng taya, saka tatakbo para kunin ang tsinelas bago mataya. Sikat ito dahil lata at tsinelas lang ang kailangan.' },
  sipa: {
    en: 'Sipa means "kick". Players keep a small weighted toy in the air, traditionally a washer or coin with colourful strips of paper or plastic, using their feet, knees and elbows. Sipa is very old and was often called the Philippine national sport, until arnis was named the national martial art and sport in 2009.',
    tl: 'Ang ibig sabihin ng sipa ay "kick." Sinisipa pataas ng mga manlalaro, at hindi pinababagsak, ang maliit na laruang may pabigat, karaniwang washer o barya na may makukulay na papel o plastik, gamit ang paa, tuhod at siko. Napakatanda na ng sipa at madalas itong tawaging pambansang laro ng Pilipinas, hanggang ideklara ang arnis na pambansang sining at isport noong 2009.' },
  holen: {
    en: 'Holen is the Filipino name for marbles. Players flick their marble with the thumb to knock other marbles out of a circle drawn on the ground. Marble games are thousands of years old, and Filipino kids also play tatsing, a similar game with coins.',
    tl: 'Ang holen ay ang Pilipinong tawag sa marbles. Pinipitik ng manlalaro ang kanyang holen gamit ang hinlalaki para mapalabas ang ibang holen sa bilog na iginuhit sa lupa. Libu-libong taon na ang mga larong holen, at naglalaro rin ang mga batang Pilipino ng tatsing, isang katulad na laro gamit ang barya.' },
  palosebo: {
    en: 'Palosebo comes from the Spanish words "palo" (pole) and "sebo" (grease). A tall bamboo pole is greased to make it slippery, and players race to climb it and grab the prize tied at the top. It is a highlight of many town fiestas.',
    tl: 'Galing ang palosebo sa mga salitang Kastila na "palo" (poste) at "sebo" (grasa). Pinapahiran ng grasa ang mataas na kawayan para dumulas, at nag-uunahan ang mga manlalaro na umakyat at kunin ang premyong nakatali sa tuktok. Isa ito sa mga inaabangan sa maraming pista.' }
};

FZ.TRICKS = {
  patintero: [{ at: 5, emoji: '🟣', en: 'New! The head guard (patotot) now runs up and down the long middle line. Stay away from the middle when he is near!', tl: 'Bago! Ang patotot ay tumatakbo na pataas-pababa sa mahabang gitnang linya. Lumayo sa gitna kapag malapit siya!' },
              { at: 3, emoji: '➖', en: 'New! Every few levels there is one more line, with one more tagger!', tl: 'Bago! Bawat ilang antas, may isa pang linya at isa pang bantay!' },
              { at: 12, emoji: '🔁', en: 'New! Cross and come back TWO times!', tl: 'Bago! Tumawid at bumalik nang DALAWANG beses!' },
              { at: 19, emoji: '👥', en: 'New! Some lines now have TWO taggers, one on each half. Look for the gap between them!', tl: 'Bago! May mga linyang DALAWA na ang bantay, isa sa bawat kalahati. Hanapin ang puwang sa pagitan nila!' },
              { at: 24, emoji: '🔁', en: 'New! THREE round trips. You can do it!', tl: 'Bago! TATLONG balikan. Kaya mo \'yan!' }],
  agawan: [{ at: 4, emoji: '🏃🏃', en: 'New! Now TWO red players chase you. Run back to your base to be safe!', tl: 'Bago! DALAWA na ang humahabol. Bumalik sa base ninyo para ligtas!' },
           { at: 8, emoji: '🏃🏃🏃', en: 'New! Three red players now. And touch their base TWO times!', tl: 'Bago! Tatlo na ang kalaban. At hawakan ang base nila nang DALAWANG beses!' },
           { at: 11, emoji: '🧤', en: 'New! One red player now stays near their flag like a goalkeeper. Fake one way, then run around the other way!', tl: 'Bago! May isang kalabang nagbabantay malapit sa bandila nila. Lumihis sa isang direksiyon, saka umikot sa kabila!' },
           { at: 12, emoji: '🏃🏃🏃🏃', en: 'New! FOUR red players now. Use your base to rest, then run!', tl: 'Bago! APAT na ang kalaban. Magpahinga sa base ninyo, saka tumakbo!' },
           { at: 15, emoji: '🏳️', en: 'New! A red runner now tries to steal YOUR base. Tag them before they reach it!', tl: 'Bago! May kalabang susubok umagaw ng base NINYO. Tayain siya bago niya ito maabot!' },
           { at: 16, emoji: '🏃🏃🏃🏃🏃', en: 'New! FIVE red players. Be patient and wait for your chance!', tl: 'Bago! LIMA na ang kalaban. Maging matiyaga at hintayin ang tamang pagkakataon!' }],
  taguan: [{ at: 1, emoji: '🙈', en: 'Your turn to HIDE! Walk to a hiding place and tap it while Taya counts. Then sneak back to the base!', tl: 'Ikaw naman ang MAGTATAGO! Pumunta sa taguan at i-tap ito habang nagbibilang si Taya. Saka pumuslit pabalik sa base!' },
           { at: 10, emoji: '🤫', en: 'New! Hiders don\'t wiggle anymore. Look carefully everywhere!', tl: 'Bago! Hindi na gumagalaw ang mga nakatago. Hanapin nang mabuti!' },
           { at: 12, emoji: '🌙', en: 'New! Now we play at night, under the moon. You can only see close by!', tl: 'Bago! Gabi na tayo maglalaro, sa ilalim ng buwan. Malapit lang ang nakikita mo!' },
           { at: 14, emoji: '🏃', en: 'New! Hiders may sneak back to the base when you are far away. Stay close to the base!', tl: 'Bago! Puwedeng pumuslit pabalik sa base ang mga nagtatago kapag malayo ka. Huwag lumayo sa base!' }],
  lawin: [{ at: 8, emoji: '🐥', en: 'New! Four chicks now — a longer line to protect!', tl: 'Bago! Apat na sisiw na — mas mahabang pila ang babantayan!' },
          { at: 16, emoji: '🐥', en: 'New! Five chicks! The hawk also fakes left and right now.', tl: 'Bago! Limang sisiw! Nanloloko na rin ang lawin pakaliwa\'t pakanan.' },
          { at: 24, emoji: '🐥', en: 'New! Six chicks! Stay close and move fast.', tl: 'Bago! Anim na sisiw! Manatiling malapit at gumalaw nang mabilis.' }],
  tinik: [{ at: 10, emoji: '🟩', en: 'New! Don\'t jump too hard now. Stop the bar inside the green zone!', tl: 'Bago! Huwag masyadong malakas ang talon. Patigilin ang bar sa berde!' }],
  baka: [{ at: 10, emoji: '🟩', en: 'New! Don\'t hold too long now. Let go inside the green zone!', tl: 'Bago! Huwag masyadong matagal pumindot. Bumitaw kapag nasa berde!' }],
  garter: [{ at: 6, emoji: '🎀', en: 'The rope is higher now, and the patterns get longer. Watch the chips carefully!', tl: 'Mas mataas na ang garter, at humahaba ang ayos. Tingnang mabuti ang mga chip!' }],
  piko: [{ at: 15, emoji: '🧠', en: 'New! The boxes don\'t glow anymore. Remember: one foot, one foot, two feet…', tl: 'Bago! Hindi na umiilaw ang mga kahon. Tandaan: isang paa, isang paa, dalawang paa…' }],
  sipa: [{ at: 10, emoji: '🌬️', en: 'New! The sipa drifts more to the sides now. Swipe fast to get under it!', tl: 'Bago! Mas lumilihis na ang sipa sa gilid. Mag-swipe nang mabilis para masalo ito!' },
         { at: 20, emoji: '💪', en: 'New! The sipa falls faster. Run under it early, then tap!', tl: 'Bago! Mas mabilis nang bumagsak ang sipa. Tumakbo agad sa ilalim nito, saka pumindot!' }],
  kadang: [{ at: 9, emoji: '🥈', en: 'New! Now you must finish 1st or 2nd.', tl: 'Bago! Kailangan mo nang matapos nang 1st o 2nd.' },
            { at: 10, emoji: '🎋', en: 'New! Bamboo stilts (tayakad)! You stand higher, so keep your balance.', tl: 'Bago! Tayakad na kawayan! Mas mataas ka na, kaya ingatan ang balanse.' },
            { at: 19, emoji: '🥇', en: 'New! Now you must WIN the race. The stilts get taller too!', tl: 'Bago! Kailangan mo nang MANALO sa karera. Tumataas din ang kawayan!' }],
  holen: [{ at: 8, emoji: '👧', en: 'New! Ate Mae plays now. She aims better, and there are more marbles in the circle.', tl: 'Bago! Si Ate Mae na ang kalaro. Mas magaling siyang umasinta, at mas marami na ang holen sa bilog.' },
          { at: 15, emoji: '👦', en: 'New! Kuya Ben plays now, and the aiming line is shorter. Trust your eyes!', tl: 'Bago! Si Kuya Ben na ang kalaro, at mas maikli na ang guhit na pang-asinta. Magtiwala sa iyong mata!' },
          { at: 23, emoji: '👴', en: 'Lolo Ambo is here, the best shooter in town. Shoot again by staying inside the circle!', tl: 'Narito si Lolo Ambo, ang pinakamagaling tumira. Manatili sa loob ng bilog para makatira ulit!' }],
  sungka: [{ at: 10, emoji: '👧', en: 'New players to beat! They are better at counting shells.', tl: 'Bagong kalaban! Mas magaling silang magbilang ng sigay.' },
           { at: 20, emoji: '👦', en: 'Kuya Ben is here, the cleverest player. Plan your moves!', tl: 'Narito si Kuya Ben, ang pinakamatalinong kalaro. Planuhin ang iyong galaw!' }],
  dama: [{ at: 10, emoji: '🔴', en: 'New! A full board now: 12 pieces each. Red also plays more carefully.', tl: 'Bago! Buong board na: tig-12 takip. Mas maingat na ring maglaro si Pula.' }]
};
