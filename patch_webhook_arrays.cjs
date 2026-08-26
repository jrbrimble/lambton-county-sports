const fs = require('fs');
let content = fs.readFileSync('server/webhookHandler.ts', 'utf8');

const replacement = `
    const parseField = (val: any): string => {
      if (Array.isArray(val)) return val.join(", ").trim();
      if (typeof val === "string") return val.trim();
      return String(val || "").trim();
    };

    const parsedSportName = parseField(sportName);
    const parsedOrganization = parseField(organization);
    const parsedAgeGroups = parseField(ageGroups);
    const parsedRegistrationUrl = parseField(registrationUrl);

    if (!parsedSportName || !parsedOrganization || !parsedAgeGroups || !parsedRegistrationUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = await getDb();
    
    // 3. Insert into database (isActive = false so it's pending review)
    await db.insert(sportsPrograms).values({
      submitterName: parseField(submitterName) || null,
      submitterEmail: parseField(submitterEmail) || null,
      submitterPhone: parseField(submitterPhone) || null,
      sportName: parsedSportName,
      organization: parsedOrganization,
      townArea: parseField(townArea) || null,
      ageGroups: parsedAgeGroups,
      registrationUrl: parsedRegistrationUrl,
      websiteUrl: parseField(websiteUrl) || null,
      notes: parseField(notes) || null,
      isActive: false, // Must be manually activated in Admin
    });

    console.log("[Webhook] Successfully inserted pending program:", parsedSportName);`;

const targetRegex = /if \(!sportName \|\| !organization \|\| !ageGroups \|\| !registrationUrl\) \{[\s\S]*?console\.log\("\[Webhook\] Successfully inserted pending program:", sportName\);/g;

content = content.replace(targetRegex, replacement.trim());

fs.writeFileSync('server/webhookHandler.ts', content);
console.log('webhookHandler.ts updated to support arrays');
