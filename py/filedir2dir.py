#! /usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import shutil
import argparse

mDefHashAlgoritm="sha256"
mNameFileDat="file.dat"
mReadBlockSize=4096
mDepth=8

def getArgs(args=None):
    mParser=argparse.ArgumentParser(description='Someting ...')
    mParser.add_argument('filename')
    mParser.add_argument('dstDir')
    return mParser.parse_args(args)
    
def dstPathMake(aDstPath):
    if not os.path.exists(aDstPath):
        os.makedirs(aDstPath)
            
        
def fileDir2Dir(aFileName,aDstDir):
    locInFullFileName=os.path.abspath(aFileName)
    if os.path.exists(locInFullFileName) and not os.path.islink(locInFullFileName):
        locDstFullPath=os.path.abspath(aDstDir)
        if os.path.dirname(locInFullFileName) <> locDstFullPath:
            dstPathMake(locDstFullPath)
            locNewFullFileName=os.path.join(locDstFullPath,mNameFileDat)
            if not os.path.exists(locNewFullFileName):
                shutil.copyfile(locInFullFileName,locNewFullFileName)
            os.remove(locInFullFileName)
#            if os.path.exists(locNewFullFileName):
#                os.remove(locInFullFileName)
#            else:
#                os.rename(locInFullFileName,locNewFullFileName)
#            os.symlink(locNewFullFileName,locInFullFileName)

def main():
    locArgs=getArgs()
    fileDir2Dir(locArgs.filename,locArgs.dstDir)
    return 0
    
if __name__ == "__main__":
    sys.exit(main())
    
