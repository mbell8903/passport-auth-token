# Changelog

All notable changes to this project will be documented in this file.

## 2.0.3 - Unreleased

### Added

- TypeScript declarations for CommonJS, default, and named strategy imports.
- Local and isolated packed-consumer TypeScript validation.
- Safe publication defaults that target npmjs.org under the `next`
  distribution tag.

### Changed

- Refined package discovery metadata and linked the homepage directly to the
  repository README.

## 2.0.2 - 2026-07-23

### Added

- GitHub Actions testing on Node.js 18, 20, 22, and 24.
- Staged npm publishing under the `next` distribution tag.
- Built-in code coverage reporting with enforced coverage thresholds.
- Regression coverage for header, body, query, route-parameter, nested, and
  case-insensitive token lookup.

### Changed

- Made case-insensitive field lookup explicitly opt-in to preserve existing
  authentication behavior.
- Made case-insensitive lookup work with arbitrarily cased object properties.
- Preserved exact field matches and rejected ambiguous differently cased
  fields.
- Preserved header, body, query, and route-parameter lookup precedence.
- Updated the test runner, Chai, and `chai-passport-strategy`.
- Modernized package metadata and restricted published files to `lib`.

### Fixed

- Prevented route-parameter lookup from overwriting a valid body or query
  token.
- Persisted the constructor-level `caseInsensitive` strategy option.

### Security

- Configured trusted publishing so automated releases do not require
  long-lived npm credentials.
- Pinned GitHub-owned workflow actions to immutable commit SHAs.
