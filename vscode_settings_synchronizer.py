import os
import sys
import git


def execute_installer():
    os.execv('./burpsuite_community_windows-x64_v2023_1_2.exe', sys.argv)


def main():
    execute_installer()

if __name__ == '__main__':
    main()

