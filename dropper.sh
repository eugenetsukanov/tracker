#!/bin/bash

mongo tracker_dev <<EOF
db.tasks.drop()
db.fs.files.drop()
db.fs.chunks.drop()
EOF