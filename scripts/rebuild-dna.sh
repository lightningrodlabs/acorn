
# will clear existing session, beware!
npm run dna-pack
cp dna/workdir/profiles.dna electron/binaries/profiles.dna
cp dna/workdir/projects.dna electron/binaries/projects.dna
rm -rf user-data
rm -rf user2-data
# npm run electron