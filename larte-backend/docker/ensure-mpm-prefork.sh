#!/usr/bin/env bash
set -euo pipefail

# php:*-apache ships mod_php, which requires mpm_prefork.
# Debian enables mpm_event by default; the base image disables it once at build time.
# Re-apply the single-MPM policy here so later layers or runtime cannot load both.
a2dismod mpm_event mpm_worker 2>/dev/null || true
a2enmod mpm_prefork

apache2ctl configtest
