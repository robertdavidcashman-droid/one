#!/usr/bin/env node
/** Fix inaccurate Maidstone custody references in published blog JSON. */
import fs from "fs";
import path from "path";

const DIR = path.join(process.cwd(), "data", "blog-posts");

const replacements = [
  [
    /Medway, Maidstone, Canterbury, North Kent \(Gravesend\), and Tonbridge/g,
    "Medway, Canterbury, North Kent (Gravesend), and Tonbridge (Maidstone hosts voluntary interviews only — custody closed)",
  ],
  [
    /Medway, Maidstone, Canterbury, Folkestone and others/g,
    "Medway, Canterbury, Folkestone and others (Maidstone: voluntary interviews only)",
  ],
  [
    /Medway, Maidstone, Canterbury, Folkestone, Dover and others/g,
    "Medway, Canterbury, Folkestone, Dover and others (Maidstone: voluntary interviews only)",
  ],
  [
    /Custody suites across Kent include Medway, North Kent \(Gravesend\), Tonbridge, Maidstone, Canterbury, Folkestone/g,
    "Custody suites across Kent include Medway, North Kent (Gravesend), Tonbridge, Canterbury, and Folkestone (Maidstone hosts voluntary interviews only — custody closed)",
  ],
  [
    /Kent custody suites including Medway, Maidstone, Canterbury/g,
    "Kent custody suites including Medway and Canterbury (Maidstone hosts voluntary interviews only)",
  ],
  [
    /including Medway, Gravesend, Tonbridge, Canterbury, Folkestone, Maidstone, Sevenoaks/g,
    "including Medway, Gravesend, Tonbridge, Canterbury, Folkestone, Maidstone (voluntary interviews), and Sevenoaks",
  ],
];

let patched = 0;
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  const fp = path.join(DIR, file);
  let text = fs.readFileSync(fp, "utf8");
  let changed = false;
  for (const [pattern, replacement] of replacements) {
    if (pattern.test(text)) {
      text = text.replace(pattern, replacement);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(fp, text);
    console.log("Patched", file);
    patched++;
  }
}
console.log(`Done: ${patched} file(s) patched.`);
