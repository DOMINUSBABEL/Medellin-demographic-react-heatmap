from playwright.sync_api import Page, expect, sync_playwright

def test_map_load(page: Page):
    # 1. Go to the app.
    page.goto("http://localhost:3000")

    # 2. Wait for the map container to be visible.
    # The MapContainer has className "leaflet-container" usually.
    # In MapVisualizer.tsx: className="h-full w-full bg-slate-900"
    # and it uses MapContainer from react-leaflet.

    # Let's look for the attribution which is a good indicator of Leaflet loading.
    attribution = page.get_by_role("link", name="CARTO")
    expect(attribution).to_be_visible()

    # 3. Check for console errors.
    page.on("console", lambda msg: print(f"Console {msg.type}: {msg.text}"))

    # 4. Take a screenshot.
    page.screenshot(path="verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_map_load(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"Verification script failed: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
