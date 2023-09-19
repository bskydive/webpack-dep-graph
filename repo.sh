#!/bin/bash

git remote add gh git@github.com:bskydive/webpack-dep-graph.git && echo "gh added"
git remote add gl git@gitlab.com:stepanovv/webpack-dep-graph.git && echo "gl added"
git remote show | grep origin && git remote remove origin && echo "origin removed"