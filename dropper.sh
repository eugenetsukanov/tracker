#!/bin/bash

mongo tracker_dev <<EOF
db.tasks.drop()
EOF