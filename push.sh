#!/bin/bash
# git remote add gl git@gitlab.com:stepanovv/webpack-dep-graph.git
# git remote add gh git@github.com:bskydive/webpack-dep-graph.git

git add -A ./*
git commit -am "forgot to add files"
git push gh --all
git push gl --all
