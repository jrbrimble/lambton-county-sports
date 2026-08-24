const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Login.tsx', 'utf8');

if (!content.includes('const [phone, setPhone]')) {
  content = content.replace(
    'const [name, setName] = useState("");',
    `const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactPref, setContactPref] = useState("email"); // "email", "phone", "both"`
  );
}

// Add the input fields in the render block
const registerFields = `          {mode === "register" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="519-555-1234"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Public Contact Preference</Label>
                <p className="text-xs text-[#666] mb-2">How should buyers contact you for Equipment Swap listings?</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="contactPref" value="email" checked={contactPref === "email"} onChange={() => setContactPref("email")} /> Email Only
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="contactPref" value="phone" checked={contactPref === "phone"} onChange={() => setContactPref("phone")} /> Phone Only
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="contactPref" value="both" checked={contactPref === "both"} onChange={() => setContactPref("both")} /> Both
                  </label>
                </div>
              </div>
            </div>
          )}`;

content = content.replace(
  /\{\s*mode === "register" && \(\s*<div>\s*<Label htmlFor="name">Name<\/Label>[\s\S]*?<\/div>\s*\)\s*\}/,
  registerFields
);

// Update handleSubmit
content = content.replace(
  /if \(mode === "register" && name\) body\.name = name;/,
  `if (mode === "register") {
        if (name) body.name = name;
        if (phone) body.phone = phone;
        body.showEmail = (contactPref === "email" || contactPref === "both").toString();
        body.showPhone = (contactPref === "phone" || contactPref === "both").toString();
      }`
);
content = content.replace(/Record<string, string>/, 'Record<string, string | boolean>');

// Update UI
content = content.replace(
  /\{mode === "login" \? "Admin Login" : "Create Account"\}/,
  `{mode === "login" ? "Sign In" : "Create Account"}`
);

content = content.replace(
  /navigate\("\/admin"\);/,
  `// Check if user is admin after login, else go to dashboard
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const me = await meRes.json();
        if (me?.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }`
);

fs.writeFileSync('client/src/pages/Login.tsx', content);
console.log('Login.tsx updated!');
