import struct
from pathlib import Path
for x in Path('public/assets/images/volumes').glob('*.ktx2'):
 a=x.read_bytes();print(x.name, struct.unpack_from('<13I2Q',a,12),len(a))
