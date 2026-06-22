# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Guide

Read `AGENTS.md` for the full architecture guide, coding conventions, and Next.js 16 patterns. It applies to ALL AI agents working in this repo.

## Claude-Specific Notes

- Use `rtk` prefix for all shell commands (git, ls, grep, etc.) — see `~/.claude/RTK.md`
- Before writing code, check `node_modules/next/dist/docs/` if unsure about Next.js 16 APIs
- React Compiler is enabled — do not use `useMemo`, `useCallback`, or `memo`
