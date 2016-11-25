#!/bin/sh
PR=$1

git fetch origin pull/$PR/head:pull/$PR
git checkout pull/$PR
