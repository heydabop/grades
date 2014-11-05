#!/bin/bash

wget $1 -O $2
pdftotext -layout $2
rm $2
