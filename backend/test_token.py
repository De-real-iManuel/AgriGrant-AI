"""Try StartJobs with the Form Filler Robot (regular Process)."""
import urllib.request, json
from pathlib import Path

env = {}
for line in Path(__file__).parent.joinpath('.env').read_text(encoding='utf-8').splitlines():
    line = line.strip()
    if not line or line.startswith('#') or '=' not in line:
        continue
    k, v = line.split('=', 1)
    env[k.strip()] = v.strip()

pat = env['UIPATH_PAT']
org = env['UIPATH_ORGANIZATION']
tenant = env['UIPATH_TENANT']
base = env['UIPATH_BASE_URL']
folder = env['UIPATH_FOLDER_ID']
robot_key = env['UIPATH_FORM_FILLER_ROBOT_KEY']

url = f"{base}/{org}/{tenant}/orchestrator_/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs"
H = {'Authorization': f'Bearer {pat}', 'Content-Type': 'application/json',
     'Accept': 'application/json', 'X-UIPATH-OrganizationUnitId': folder}

# Form Filler Robot expects flat farmer fields (per Main.xaml var defs)
body = {
    "startInfo": {
        "ReleaseKey": robot_key,
        "Strategy": "All",
        "JobsCount": 1,
        "InputArguments": json.dumps({
            "in_farmerName": "Test Farmer",
            "in_farmerEmail": "test@agrigrant.xyz",
            "in_farmerPhone": "+2348012345678",
            "in_stateOfResidence": "Lagos",
            "in_lga": "Ikeja",
            "in_farmType": "Crop Farming",
            "in_farmSizeHectares": 2.5,
            "in_grantProgram": "CBN Anchor Borrowers",
            "in_requestedFundingAmountNGN": 500000,
            "in_proposedProjectDescription": "Buy seeds and fertilizer",
            "in_hasBVN": True,
            "in_hasNoLoanDefault": True,
            "in_targetPortalURL": "https://nagap.vercel.app/grant-application-form",
        })
    }
}

print(f"POST {url}")
print(f"Robot key: {robot_key}")
req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers=H, method='POST')
try:
    with urllib.request.urlopen(req, timeout=20) as r:
        print(f"\n[SUCCESS] {r.status}")
        print(r.read().decode('utf-8')[:1500])
except urllib.error.HTTPError as e:
    print(f"\n[FAIL] HTTP {e.code}")
    print(e.read().decode('utf-8')[:1500])
