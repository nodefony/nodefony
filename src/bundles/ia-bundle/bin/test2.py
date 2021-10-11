#!/usr/bin/env python3
import copy


def my_function():
  print("Hello from a function")

class App:
    def __init__(self, realpart, imagpart):
        self.r = realpart
        self.i = imagpart
    def my_function(self):
      print("Hello from a function")

liste = [1, 10, 100, 250, 500];

print(liste[-2:])

for ele in liste:
    print(f"""{ele}
        ddd
    """)

liste.insert(0,51)
print(liste[:])


x = [[1,2], 2]
y = copy.deepcopy(x)
print(y[:])

if 10 in liste:
    print(y[:])

my_function()

app = App("rrr","eee")
print(app.r, app.i)
app.my_function()
#liste = [1,2,3,4,5,6,7,8,9,10]
#for x in liste:
#    print(f"{x}  sbbob")

#print(liste)
#print(type(liste))*/
