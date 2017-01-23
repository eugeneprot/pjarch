#! /usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import argparse
import hashlib

mDefHashAlgoritm="sha256"
mNameFileDat="file.dat"
mReadBlockSize=4096
mDepth=8

def getArgs(args=None):
    mParser=argparse.ArgumentParser(description='Someting ...')
    mParser.add_argument('filename')
    mParser.add_argument('-d','--dstDir',default=".")
    mParser.add_argument('-a','--hashAlgoritm',default=mDefHashAlgoritm)
    return mParser.parse_args(args)
    
def calcHash(aFileName,aHashAlgoritm):
    with open(aFileName,"rb") as locFile:
        locHash=hashlib.new(aHashAlgoritm)
        for locBuf in iter(lambda: locFile.read(mReadBlockSize), b""):
            locHash.update(locBuf)
    return locHash.hexdigest()

def dstPathMake(aDstPath):
    if not os.path.exists(aDstPath):
        os.makedirs(aDstPath)
            
def dstFullPath(aDstDir,aHash,aHashAlgoritm):
    locLen=len(aHash)/mDepth
    locRet=""
    for locInd in xrange(0,len(aHash),locLen):
        locRet=os.path.join(locRet,aHash[locInd:locInd+locLen])
    return os.path.join(os.path.abspath(aDstDir),aHashAlgoritm,locRet)
    
def file2hashLink(aFileName,aDstDir=".",aHashAlgoritm=mDefHashAlgoritm):
    locInFullFileName=os.path.abspath(aFileName)
    if os.path.exists(locInFullFileName) and not os.path.islink(locInFullFileName):
        locHash=calcHash(locInFullFileName,aHashAlgoritm)
        locDstFullPath=dstFullPath(aDstDir,locHash,aHashAlgoritm)
        dstPathMake(locDstFullPath)
        locNewFullFileName=os.path.join(locDstFullPath,mNameFileDat)
        if os.path.exists(locNewFullFileName):
            os.remove(locInFullFileName)
        else:
            os.rename(locInFullFileName,locNewFullFileName)
        os.symlink(locNewFullFileName,locInFullFileName)
        
def checkOs():
    return "Linux"==os.uname()[0]

def main():
    if checkOs():
        locArgs=getArgs()
        file2hashLink(locArgs.filename,locArgs.dstDir,locArgs.hashAlgoritm)
    else:
        print "Not Linux OS !!!"
        return 1
    return 0
    
if __name__ == "__main__":
    sys.exit(main())
    
