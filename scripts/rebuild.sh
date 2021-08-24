
# will clear existing session, beware!
# npm run dna-pack
# cargo build --release
cp target/release/acorn-conductor electron/binaries/acorn-conductor
cp dna/workdir/projects.dna electron/binaries/projects.dna
rm -rf tmp2
rm -rf tmp
# npm run electron