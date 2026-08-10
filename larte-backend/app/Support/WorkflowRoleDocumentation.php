<?php

namespace App\Support;

/**
 * Documents how ERP roles map to the order approval workflow.
 *
 * Client requirement (final workflow spec, section 1) explicitly defines:
 *   Representative → Manager → Accountant → Responsible → Factory
 *
 * Manager and Responsible are intentionally separate approval stages:
 *
 * - **manager** (`orders.approve.manager`): First-line operational approval.
 *   Role description: "Manage operations". Permissions focus on day-to-day
 *   management (customers, products, users.view, etc.) but not full read-only
 *   coverage of every business module.
 *
 * - **responsible** (`orders.approve.responsible`): Final administrative approval
 *   before factory processing. Role description: "Final order approval authority".
 *   Permissions: all normal business modules (viewer-like) excluding admin/system
 *   modules (users, roles, permissions, settings). OR-based: any one responsible
 *   user completes the step.
 *
 * The client's statement that "responsible has all permissions" refers to module
 * access for business pages, not to merging manager and responsible into one step.
 * Production seeds distinct users: manager@larte.com and responsible@larte.com.
 */
final class WorkflowRoleDocumentation
{
    public const APPROVAL_CHAIN_LABELS = [
        'sales' => 'Representative submission',
        'manager' => 'Manager approval',
        'accountant' => 'Accountant approval',
        'responsible' => 'Responsible approval (any one user)',
        'factory' => 'Factory processing',
    ];
}
