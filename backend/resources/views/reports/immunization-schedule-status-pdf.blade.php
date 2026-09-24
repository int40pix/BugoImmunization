<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Immunization Schedule Status Report</title>
    <style>
        @page {
            margin: 15mm 12mm 15mm 12mm;
            size: a4 landscape;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 9pt;
            color: #1f2937;
            line-height: 1.35;
        }
        .header-table {
            width: 100%;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .header-title-box {
            text-align: center;
        }
        .header-republic {
            font-size: 8pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #4b5563;
        }
        .header-agency {
            font-size: 9pt;
            font-weight: bold;
            color: #111827;
        }
        .header-center {
            font-size: 13pt;
            font-weight: 800;
            color: #0369a1;
            letter-spacing: 0.5px;
            margin: 2px 0;
        }
        .header-sub {
            font-size: 8pt;
            color: #6b7280;
        }
        .report-banner {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            padding: 8px 12px;
            border-radius: 4px;
            margin-bottom: 12px;
        }
        .report-title {
            font-size: 12pt;
            font-weight: bold;
            color: #0369a1;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .meta-grid {
            width: 100%;
            font-size: 8pt;
        }
        .meta-grid td {
            padding: 2px 4px;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 7.5pt;
            font-weight: bold;
        }
        .badge-upcoming {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #bbf7d0;
        }
        .badge-overdue {
            background-color: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fecaca;
        }
        .badge-sky {
            background-color: #e0f2fe;
            color: #0369a1;
        }
        
        .section-heading {
            font-size: 10pt;
            font-weight: bold;
            color: #0369a1;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 3px;
            margin-top: 12px;
            margin-bottom: 6px;
            text-transform: uppercase;
        }
        
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            font-size: 8pt;
        }
        table.data-table th {
            background-color: #f8fafc;
            color: #334155;
            font-weight: bold;
            text-align: left;
            padding: 5px 6px;
            border: 1px solid #cbd5e1;
            text-transform: uppercase;
            font-size: 7.5pt;
        }
        table.data-table td {
            padding: 5px 6px;
            border: 1px solid #e2e8f0;
            vertical-align: middle;
        }
        table.data-table tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: bold; }

        .signatures-table {
            width: 100%;
            margin-top: 25px;
            border-collapse: collapse;
        }
        .signatures-table td {
            width: 33.33%;
            vertical-align: top;
            padding: 0 15px;
        }
        .sig-line {
            border-bottom: 1px solid #4b5563;
            margin-top: 35px;
            margin-bottom: 4px;
        }
        .sig-name {
            font-weight: bold;
            font-size: 8.5pt;
            text-align: center;
        }
        .sig-title {
            font-size: 7.5pt;
            color: #6b7280;
            text-align: center;
        }
        .footer-note {
            margin-top: 15px;
            font-size: 7pt;
            color: #9ca3af;
            text-align: center;
            border-top: 1px dashed #e5e7eb;
            padding-top: 6px;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td class="header-title-box">
                <div class="header-republic">Republic of the Philippines &bull; Department of Health &bull; Region X</div>
                <div class="header-agency">City Health Office &bull; Cagayan de Oro City</div>
                <div class="header-center">BARANGAY BUGO HEALTH CENTER</div>
                <div class="header-sub">Zone 2, Bugo, Cagayan de Oro City, Misamis Oriental &bull; Routine Pediatric Immunization Clinic</div>
            </td>
        </tr>
    </table>

    <div class="report-banner">
        <div class="report-title">Immunization Schedule Status Report</div>
        <table class="meta-grid">
            <tr>
                <td width="25%"><strong>Date Generated:</strong> {{ $generated_at }}</td>
                <td width="25%"><strong>Generated By:</strong> {{ $generated_by }}</td>
                <td width="25%"><strong>Total Monitored Children:</strong> <span class="badge badge-sky">{{ $summary['monitored_children'] }}</span></td>
                <td width="25%">
                    <strong>Status Breakdown:</strong>
                    <span class="badge badge-upcoming">{{ $summary['upcoming_count'] }} Upcoming</span>
                    <span class="badge badge-overdue">{{ $summary['overdue_count'] }} Overdue</span>
                </td>
            </tr>
            <tr>
                <td colspan="4">
                    <strong>Applied Filters:</strong> 
                    Status Scope: <strong>{{ strtoupper($filters['status']) }}</strong> &bull;
                    Vaccine: {{ $filters['vaccine_id'] !== 'all' ? 'Specific ID (' . $filters['vaccine_id'] . ')' : 'All Antigens' }} &bull;
                    Target Date Window: {{ $filters['date_from'] ? $filters['date_from'] : 'Earliest' }} to {{ $filters['date_to'] ? $filters['date_to'] : 'Latest' }}
                    @if($filters['search'])
                        &bull; Search Query: "{{ $filters['search'] }}"
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <!-- Section 1: Children Schedule Status Line Listing -->
    <div class="section-heading">Child Immunization Schedule & Target Status Outlines</div>
    <table class="data-table">
        <thead>
            <tr>
                <th width="8%">Patient ID</th>
                <th width="14%">Child Name</th>
                <th width="5%" class="text-center">Sex</th>
                <th width="8%">Current Age</th>
                <th width="13%">Parent / Guardian</th>
                <th width="10%">Contact</th>
                <th width="12%">Vaccine Dose</th>
                <th width="10%">Target Date</th>
                <th width="8%" class="text-center">Status</th>
                <th width="12%">Timeline / Note</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
            <tr>
                <td class="font-semibold">{{ $row['patient_id'] }}</td>
                <td class="font-bold">{{ $row['patient_name'] }}</td>
                <td class="text-center">{{ substr($row['sex'], 0, 1) }}</td>
                <td>{{ $row['current_age'] }}</td>
                <td>{{ $row['guardian_name'] }}</td>
                <td>{{ $row['guardian_contact'] }}</td>
                <td>
                    <span class="font-semibold">{{ $row['vaccine_name'] }}</span>
                    <span style="color: #4b5563;">({{ $row['dose_label'] }})</span>
                </td>
                <td>
                    <strong>{{ $row['scheduled_date_formatted'] }}</strong><br>
                    <span style="font-size: 7pt; color: #64748b;">{{ $row['scheduled_day'] }}</span>
                </td>
                <td class="text-center">
                    @if($row['status'] === 'overdue')
                        <span class="badge badge-overdue">OVERDUE</span>
                    @else
                        <span class="badge badge-upcoming">UPCOMING</span>
                    @endif
                </td>
                <td>
                    <span class="font-semibold" style="{{ $row['status'] === 'overdue' ? 'color: #b91c1c;' : 'color: #15803d;' }}">
                        {{ $row['days_label'] }}
                    </span><br>
                    <span style="font-size: 7pt; color: #64748b;">{{ $row['remarks'] }}</span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="10" class="text-center" style="padding: 15px; color: #9ca3af;">
                    No child schedules match the selected filters.
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <table class="signatures-table">
        <tr>
            <td>
                <div class="sig-line"></div>
                <div class="sig-name">{{ $generated_by }}</div>
                <div class="sig-title">Clinic Healthcare Staff / Recorder</div>
            </td>
            <td>
                <div class="sig-line"></div>
                <div class="sig-name">Public Health Nurse / Midwife</div>
                <div class="sig-title">Barangay Bugo Health Center</div>
            </td>
            <td>
                <div class="sig-line"></div>
                <div class="sig-name">Elena B. Nuque</div>
                <div class="sig-title">Health Center Representative / Officer</div>
            </td>
        </tr>
    </table>

    <div class="footer-note">
        Official Document &bull; Generated from Barangay Bugo Pediatric Immunization Management System &bull; DOH Compliance Monitoring &bull; Page 1 of 1
    </div>

</body>
</html>
