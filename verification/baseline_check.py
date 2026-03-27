from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000/")

        print("Page loaded.")

        # Wait for any leaflet element attached to DOM
        try:
            page.wait_for_selector(".leaflet-container", state="attached", timeout=10000)
            print("Leaflet container found (attached).")

            # check visibility
            is_visible = page.is_visible(".leaflet-container")
            print(f"Leaflet container visible? {is_visible}")

            box = page.locator(".leaflet-container").bounding_box()
            print(f"Leaflet container box: {box}")

        except Exception as e:
            print(f"Error waiting for leaflet container: {e}")
            # Take a screenshot to debug
            page.screenshot(path="verification/debug_error.png")
            browser.close()
            return

        # Give it a moment to render the polygons
        time.sleep(5)

        # Count SVG paths in the overlay pane
        # Leaflet puts SVG paths in .leaflet-overlay-pane > svg > g > path
        path_count = page.locator(".leaflet-overlay-pane path").count()
        canvas_count = page.locator(".leaflet-overlay-pane canvas").count()

        print(f"SVG Paths found: {path_count}")
        print(f"Canvas elements found: {canvas_count}")

        if path_count > 0:
            print("Rendering mode: SVG (Likely)")
        elif canvas_count > 0:
             print("Rendering mode: Canvas (Likely)")
        else:
            print("Rendering mode: Unknown (No paths or canvas found)")
            # Maybe the data hasn't loaded?

        page.screenshot(path="verification/baseline.png")

        browser.close()

if __name__ == "__main__":
    run()
