#!/usr/bin/env python
import os
from pathlib import Path

import yaml

# The password used in fixtures
TEST_PASSWORD = "password123"


# Generate MD5 hashed password directly
def make_md5_password(password):
    import hashlib

    salt = "salt123"  # Using a fixed salt for reproducibility
    md5_hash = hashlib.md5(f"{salt}{password}".encode()).hexdigest()
    return f"md5${salt}${md5_hash}"


md5_password = make_md5_password(TEST_PASSWORD)


def update_fixture(file_path):
    try:
        with open(file_path, "r") as f:
            data = yaml.safe_load(f)

        if not data or not isinstance(data, list):
            return False

        changed = False
        for item in data:
            if (
                isinstance(item, dict)
                and item.get("model") == "account.user"
                and "fields" in item
                and "password" in item["fields"]
            ):
                item["fields"]["password"] = md5_password
                changed = True

        if changed:
            with open(file_path, "w") as f:
                yaml.dump(data, f, default_flow_style=False, allow_unicode=True)
            print(f"Updated {file_path}")
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return False


def main():
    # Only look in tests directory
    tests_dir = Path(__file__).resolve().parent
    fixture_paths = []

    # Find all yaml files in tests directory and its subdirectories
    for root, _, files in os.walk(tests_dir):
        for file in files:
            if file.endswith(".yaml"):
                fixture_paths.append(os.path.join(root, file))

    updated = 0
    for path in fixture_paths:
        if update_fixture(path):
            updated += 1

    print(f"\nUpdated {updated} fixture files with MD5 hashed passwords")


if __name__ == "__main__":
    main()
