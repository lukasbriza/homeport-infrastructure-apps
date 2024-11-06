#!/bin/bash
cd /application/apps/api-processor
pnpm start:production &
exec /usr/local/bin/jenkins.sh 
