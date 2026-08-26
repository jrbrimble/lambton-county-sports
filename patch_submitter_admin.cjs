const fs = require('fs');
let content = fs.readFileSync('client/src/pages/Admin.tsx', 'utf8');

const submitterBlock = `
            {program?.submitterName && (
              <div className="bg-slate-50 p-4 rounded-lg mt-4 border border-slate-200">
                <h4 className="font-semibold text-sm mb-2 text-slate-700">Submitter Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">Name:</span> {program.submitterName}</div>
                  <div><span className="text-slate-500">Phone:</span> {program.submitterPhone || "N/A"}</div>
                  <div className="col-span-2"><span className="text-slate-500">Email:</span> {program.submitterEmail}</div>
                </div>
              </div>
            )}
`;

content = content.replace(
  '<DialogFooter>',
  submitterBlock + '\n            <DialogFooter>'
);

fs.writeFileSync('client/src/pages/Admin.tsx', content);
console.log('Patched Admin.tsx with submitter info UI');
