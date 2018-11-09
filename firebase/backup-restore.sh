#! /bin/bash
rm -rf backup/*
firestore-backup-restore --accountCredentials prod-key.json --backupPath backup
rm -rf backup/students/ backup/teachers/ backup/brickattempts/ backup/classes/
git add backup/
git commit -m "added backup"
git push origin dev
firestore-backup-restore --restoreAccountCredentials dev-key.json --backupPath backup

