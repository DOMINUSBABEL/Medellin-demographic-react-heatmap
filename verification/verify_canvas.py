from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))

        page.goto("http://localhost:3000/")

        print("Page loaded.")

        # Wait for any leaflet element attached to DOM
        try:
            page.wait_for_selector(".leaflet-container", state="attached", timeout=10000)
            print("Leaflet container found.")

        except Exception as e:
            print(f"Error waiting for leaflet container: {e}")
            page.screenshot(path="verification/debug_error.png")
            browser.close()
            return

        # Give it a moment to render the polygons
        time.sleep(5)

        # Count SVG paths in the overlay pane
        path_count = page.locator(".leaflet-overlay-pane path").count()
        canvas_count = page.locator(".leaflet-overlay-pane canvas").count()

        print(f"SVG Paths found: {path_count}")
        print(f"Canvas elements found: {canvas_count}")

        if path_count > 0:
            print("Rendering mode: SVG (Likely)")
        elif canvas_count > 0:
             print("Rendering mode: Canvas (Likely)")
        else:
            print("Rendering mode: Unknown")

        # Try to interact to verify data presence
        # Get map center from the container box
        box = page.locator(".leaflet-container").bounding_box()
        if box:
            center_x = box["x"] + box["width"] / 2
            center_y = box["y"] + box["height"] / 2
            print(f"Hovering at {center_x}, {center_y}")
            page.mouse.move(center_x, center_y)
            time.sleep(1)

            # Check for tooltip
            tooltip = page.locator(".leaflet-tooltip")
            if tooltip.count() > 0 and tooltip.first.is_visible():
                print("Tooltip visible! Interaction works.")
                print(f"Tooltip text: {tooltip.first.inner_text()}")
            else:
                print("Tooltip NOT visible.")

        page.screenshot(path="verification/canvas_verification.png")

        browser.close()

if __name__ == "__main__":
    run()
