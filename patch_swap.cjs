const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Swap.tsx', 'utf8');

// 1. Update NewListingForm state and remove posterName, posterEmail, posterPhone
content = content.replace(/posterName:\s*""\s*,\s*posterEmail:\s*""\s*,\s*posterPhone:\s*""\s*,/g, '');
content = content.replace(/posterName:\s*form\.posterName,\s*posterEmail:\s*form\.posterEmail,\s*posterPhone:\s*form\.posterPhone \|\| undefined,/g, '');
content = content.replace(/if \(!form\.sportCategory \|\| !form\.itemName \|\| !form\.condition \|\| !form\.posterName \|\| !form\.posterEmail\) {/g, 'if (!form.sportCategory || !form.itemName || !form.condition) {');

// 2. Remove the "Your Contact Info" section entirely from the form
content = content.replace(/<div className="border-t border-slate-200 pt-5">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

// 3. Update the listing rendering mapping
content = content.replace(/listings\.map\(\(listing\) => \{/g, 'listings.map(({ listing, user }) => {');

// 4. Update the places where listing.xxx was used for user stuff
content = content.replace(/listing\.posterName/g, 'user.name');
content = content.replace(/listing\.posterEmail/g, 'user.showEmail && user.email');
content = content.replace(/listing\.posterPhone/g, 'user.showPhone && user.phone');

// 5. Update auth check for the button
if (!content.includes('const { data: user } = trpc.auth.me.useQuery();')) {
  content = content.replace('const [, navigate] = useLocation();', 'const [, navigate] = useLocation();\n  const { data: user } = trpc.auth.me.useQuery();');
}

content = content.replace(
  /onClick=\{\(\) => setShowNewListing\(true\)\}/g,
  `onClick={() => {
                if (!user) {
                  navigate("/login");
                } else {
                  setShowNewListing(true);
                }
              }}`
);
content = content.replace(
  />\s*<Plus className="w-5 h-5" \/>\s*Post Equipment/g,
  `>
              {user ? (
                <><Plus className="w-5 h-5" /> Post Equipment</>
              ) : (
                "Sign in to Post"
              )}`
);
content = content.replace(
  />\s*<Plus className="w-5 h-5" \/>\s*Post Your First Item/g,
  `>
              {user ? (
                <><Plus className="w-5 h-5" /> Post Your First Item</>
              ) : (
                "Sign in to Post"
              )}`
);

content = content.replace('Listings last 30 days', 'Listings last 60 days');

fs.writeFileSync('client/src/pages/Swap.tsx', content);
console.log('Swap.tsx updated!');
