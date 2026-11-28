# Hand-checked corrections applied after the automatic speaker guess.
# FIX[book][(page, quote)] = speaker  (pages and quotes count from 0; None = narrator, '_crowd' = everyone)
TYPES = {
  'b44': {'Buwaya': 'big', 'Haring Buwaya': 'oldman'},
  'b47': {'Lila': 'girl'},
  'b50': {'diwata': 'woman'},
}
FIX = {
  'b38': {(15,0): None},
  'b41': {(0,0): 'Pilandok'},
  'b42': {(2,0): 'Tipaklong'},
  'b44': {(1,0):'Buwaya',(3,0):'Haring Buwaya',(3,1):'Haring Buwaya',(5,0):'Buwaya',(5,1):'Buwaya',(7,0):'Buwaya',(7,1):'Buwaya',
          (8,0):'Matsing',(10,0):'Buwaya',(12,0):'Buwaya',(12,1):'Buwaya',(13,0):'Buwaya',(14,0):'Matsing',(14,1):'Matsing'},
  'b45': {(1,0):'Kuneho',(2,1):'Pagong',(4,0):'_crowd',(7,0):'Pagong',(11,1):'_crowd'},
  'b46': {(4,0):'Paruparo',(5,0):'Paruparo',(5,1):'Paruparo',(9,0):'mangangaso',(9,1):'mangangaso',(13,0):'mangangaso'},
  'b47': {(6,0):'Lila',(6,1):'Lila',(7,2):'_crowd',(10,0):'_crowd'},
  'b48': {(9,0):'Liwayway',(11,0):'_crowd'},
  'b49': {(1,0):'Manggita',(2,0):'Lola',(7,0):'diwata',(7,1):'diwata',(8,2):'diwata'},
  'b50': {(8,0):'diwata',(8,1):'diwata',(9,0):'diwata',(9,1):'diwata'},
  'b51': {(8,1):'diwata',(10,0):'Ella',(10,1):'Ella',(11,1):'Ella',(14,0):'Ella',(15,0):'Ella',(15,1):'Ella',(16,0):None},
  'b52': {(1,0):'_crowd',(1,1):'_crowd',(5,0):'babae',(9,0):'Nonoy'},
}
def apply(out):
    for bid,t in TYPES.items(): out[bid]['types'].update(t)
    for bid,fx in FIX.items():
        for (p,q),who in fx.items():
            pg=out[bid]['pages'][p]
            while len(pg)<=q: pg.append(None)
            pg[q]=who
    return out
