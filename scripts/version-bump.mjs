import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Get next version from get-next-version
const nextVersion = execSync("get-next-version", { encoding: "utf8" }).trim();
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(__dirname, "../package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
if (pkg.version === nextVersion) {
  console.log(`Version is already at ${nextVersion}. No changes made.`);
  process.exit(0);
}

pkg.version = nextVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

// Git commit, tag, and push
execSync("git add package.json", { stdio: "inherit" });
execSync(`git commit -m "chore: bump version to ${nextVersion}"`, {
  stdio: "inherit",
});
execSync(`git tag v${nextVersion} -m "chore: bump version to ${nextVersion}"`, { stdio: "inherit" });
execSync("git push", { stdio: "inherit" });
execSync("git push --tags", { stdio: "inherit" });

console.log(`Version bumped to ${nextVersion}`);
