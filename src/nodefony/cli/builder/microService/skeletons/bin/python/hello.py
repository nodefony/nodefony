#!/usr/bin/env python

class HelloWord:

    tab = []

    def __init__(self):
        self.add_tab("Script Python")
        self.add_tab("Hello")
        self.add_tab("Word")
        self.toString()

    def add_tab(self, val):
        self.tab.append(val)

    def toString(self):
        print(' '.join(map(str, self.tab)) )


inst = HelloWord()
