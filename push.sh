#!/bin/bash
# git remote add gl git@gitlab.com:stepanovv/webpack-dep-graph.git
# git remote add gh git@github.com:bskydive/webpack-dep-graph.git

git add -A ./*
git commit -am "add files"
git push gh release-v1.4.0
git push gl release-v1.4.0
