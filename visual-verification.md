# Visual Verification Notes

The refreshed Canopy landing page was inspected at desktop and mobile sizes. The desktop view shows the new editorial hero layout, field-note card, metric strip, calmer format cards, contextual facts panel, share bar, and footer. The mobile view collapses to a single-column layout with a stacked subscription form and readable typography.

The browser interaction test clicked the header theme control. The visible button changed from `◐ Dark` to `☀ Light`, and the preview switched to the dark palette: dark green-black background, light text, green accent headline, and readable surfaces. The interactive page content remained present after the theme change.

The preview was reloaded after switching to dark mode; the header still displayed `☀ Light` and the dark palette remained active, confirming persistence across reloads. The subscription field was exercised with `not-an-email` without submitting or adding a record; the backend-validation path is wired to return the specific invalid-email message in the refreshed form.

Submitting `not-an-email` produced the visible inline error `Please enter a valid email address.` without creating a subscriber. The keyboard shortcut was sent through the browser verification session; the shortcut handler remains implemented in Home.tsx and the page stayed intact, but the browser harness mapped the modifier as Meta rather than Control, so the shortcut did not open the modal in that harness.

A controlled `Control+Shift+S` keyboard event opened the hidden subscriber modal. The modal rendered the owner-access gate and close action, confirming the trigger works while unauthenticated access remains blocked.

Three dispatched clicks on the footer copyright opened the same hidden subscriber modal, confirming the triple-click trigger works. The unauthenticated session displayed the owner-access gate rather than subscriber data.

After the owner account signed in, the hidden panel opened successfully via an explicit Control+Shift+S event. It displayed the stored subscriber list, including `edgarzhang621@gmail.com`, and exposed the `Export CSV` and `Clear all` controls. Clicking `Export CSV` produced the visible `Subscriber list exported` confirmation, verifying the owner export flow.

The share/copy-link bar is no longer present. The bottom of the page now contains a concise Editions archive with the current Issue 01 / Field Notes entry, followed only by the copyright footer. Desktop and 375px mobile full-page previews show the archive fitting cleanly without horizontal overflow. The previous filler footer note has been removed.

The wildlife coverage update is visible in the landing-page introduction, the Canopy Labs description, and the Edition 01 archive topic labels. The 375px full-page preview remains contained and readable.

The placeholder hero teaser and fake Edition 01 entry have been removed. The hero card now states `No editions available yet.` and the archive shows the same truthful empty state. The 375px full-page preview remains contained and readable.

The new About, Resources, Wildlife, and wildlife subtopic routes render on desktop and at 375px mobile width. The homepage and interior headers expose About, Resources, and Wildlife navigation. Resources and all wildlife pages show explicit no-content states rather than fabricated links or editions. Mobile cards, navigation, and page headings remain within the viewport.
