import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Ouyang;Sicheng;;;",
    "FN:Sicheng Ouyang",
    "ORG:University of Waterloo",
    "TITLE:Software Engineering Student",
    "EMAIL;TYPE=INTERNET:sicheng.ouyang@uwaterloo.ca",
    `URL:${SITE_URL}`,
    "X-SOCIALPROFILE;TYPE=linkedin:https://www.linkedin.com/in/sicheng-ouyang/",
    "X-SOCIALPROFILE;TYPE=github:https://github.com/carols12352",
    "END:VCARD",
    "",
  ].join("\r\n");

  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="Sicheng-Ouyang.vcf"',
    },
  });
}
