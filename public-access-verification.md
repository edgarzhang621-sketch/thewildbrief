# Public Access Verification

On 2026-08-25, the homepage was checked at 1280px desktop width and 375px iPhone width after shifting the edition-status card. The card no longer overlaps the hero copy on desktop and stays within the mobile layout.

The application routes for the homepage and About page are public in the source code; only the hidden subscriber-management modal asks the owner to sign in. On the first check, the deployed `canopynews-rw7gptpk.manus.space` domain redirected visitors to the Manus application login screen before the website loaded. This gateway behavior is controlled by the project’s publication visibility setting, rather than by a frontend route guard.

After the visibility setting was changed to Public, the deployed domain was opened again on 2026-08-25 and loaded The Wild Brief homepage directly without a visitor sign-in. The project title setting is The Wild Brief, and no visitor-facing Canopy sign-in label appears on the public domain.

The desktop hero grid was then widened to create a clear gap between the headline and edition-status card at the affected 1024px width. The iPhone stacked layout was also checked after this correction.
