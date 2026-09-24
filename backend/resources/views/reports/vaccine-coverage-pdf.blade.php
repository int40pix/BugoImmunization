<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Vaccine Coverage Report</title>
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
            border-bottom: 2px solid #0f766e;
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
            color: #0f766e;
            letter-spacing: 0.5px;
            margin: 2px 0;
        }
        .header-sub {
            font-size: 8pt;
            color: #6b7280;
        }
        .report-banner {
            background-color: #f0fdfa;
            border: 1px solid #ccfbf1;
            padding: 8px 12px;
            border-radius: 4px;
            margin-bottom: 12px;
        }
        .report-title {
            font-size: 12pt;
            font-weight: bold;
            color: #115e59;
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
        .badge-teal { background-color: #ccfbf1; color: #0f766e; }
        .badge-blue { background-color: #dbeafe; color: #1e40af; }
        .badge-green { background-color: #dcfce7; color: #166534; }
        
        .section-heading {
            font-size: 10pt;
            font-weight: bold;
            color: #0f766e;
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
            background-color: #f3f4f6;
            color: #374151;
            font-weight: bold;
            text-align: left;
            padding: 5px 6px;
            border: 1px solid #d1d5db;
            text-transform: uppercase;
            font-size: 7.5pt;
        }
        table.data-table td {
            padding: 5px 6px;
            border: 1px solid #e5e7eb;
            vertical-align: middle;
        }
        table.data-table tr:nth-child(even) td {
            background-color: #f9fafb;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: bold; }
        
        .progress-bar-bg {
            background-color: #e5e7eb;
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            width: 50px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 4px;
        }
        .progress-bar-fill {
            background-color: #0d9488;
            height: 100%;
        }

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
        <div class="report-title">Vaccine Coverage Report</div>
        <table class="meta-grid">
            <tr>
                <td width="25%"><strong>Date Generated:</strong> {{ $generated_at }}</td>
                <td width="25%"><strong>Generated By:</strong> {{ $generated_by }}</td>
                <td width="25%"><strong>Target Cohort Population:</strong> <span class="badge badge-blue">{{ $target_population }} Children</span></td>
                <td width="25%"><strong>Total Doses Recorded:</strong> <span class="badge badge-teal">{{ $total_doses_administered }} Doses</span></td>
            </tr>
            <tr>
                <td colspan="4">
                    <strong>Applied Filters:</strong> 
                    Date Range: {{ $filters['date_from'] ? $filters['date_from'] : 'Beginning' }} to {{ $filters['date_to'] ? $filters['date_to'] : 'Present' }} &bull;
                    Vaccine: {{ $filters['vaccine_id'] !== 'all' ? 'Specific ID (' . $filters['vaccine_id'] . ')' : 'All Routine & SIA Vaccines' }} &bull;
                    Dose: {{ $filters['dose_number'] !== 'all' ? 'Dose ' . $filters['dose_number'] : 'All Doses' }}
                </td>
            </tr>
        </table>
    </div>

    <!-- Section 1: Vaccine Coverage Summary -->
    <div class="section-heading">1. Vaccine Coverage Summary by Antigen</div>
    <table class="data-table">
        <thead>
            <tr>
                <th width="18%">Vaccine Antigen</th>
                <th width="12%">Category</th>
                <th width="8%" class="text-center">Required</th>
                <th width="9%" class="text-center">Target</th>
                <th width="8%" class="text-center">Dose 1</th>
                <th width="8%" class="text-center">Dose 2</th>
                <th width="8%" class="text-center">Dose 3</th>
                <th width="8%" class="text-center">Booster</th>
                <th width="9%" class="text-center">Total Doses</th>
                <th width="12%" class="text-center">Coverage Rate</th>
            </tr>
        </thead>
        <tbody>
            @forelse($vaccine_summaries as $v)
            <tr>
                <td class="font-bold">{{ $v['name'] }}</td>
                <td>{{ $v['category'] }}</td>
                <td class="text-center">{{ $v['required_doses'] }}</td>
                <td class="text-center">{{ $v['target_population'] }}</td>
                <td class="text-center">{{ $v['dose_1'] }}</td>
                <td class="text-center">{{ $v['dose_2'] }}</td>
                <td class="text-center">{{ $v['dose_3'] }}</td>
                <td class="text-center">{{ $v['booster'] }}</td>
                <td class="text-center font-bold">{{ $v['total_administered'] }}</td>
                <td class="text-center">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: {{ min(100, $v['coverage_pct']) }}%;"></div>
                    </div>
                    <span class="font-semibold">{{ $v['coverage_pct'] }}%</span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="10" class="text-center" style="padding: 12px; color: #9ca3af;">No vaccine summary records found.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Section 2: Details About Vaccinated Children -->
    <div class="section-heading">2. Details About Vaccinated Children (Line Listing)</div>
    <table class="data-table">
        <thead>
            <tr>
                <th width="9%">Date Admin</th>
                <th width="9%">Patient ID</th>
                <th width="14%">Child Name</th>
                <th width="5%" class="text-center">Sex</th>
                <th width="8%">Age Admin</th>
                <th width="13%">Parent / Guardian</th>
                <th width="10%">Contact</th>
                <th width="11%">Vaccine Dose</th>
                <th width="8%">Batch No.</th>
                <th width="13%">Administered By</th>
            </tr>
        </thead>
        <tbody>
            @forelse($vaccinated_children as $c)
            <tr>
                <td>{{ $c['date_administered_formatted'] }}</td>
                <td class="font-semibold">{{ $c['patient_id'] }}</td>
                <td class="font-bold">{{ $c['patient_name'] }}</td>
                <td class="text-center">{{ substr($c['sex'], 0, 1) }}</td>
                <td>{{ $c['age_at_admin'] }}</td>
                <td>{{ $c['guardian_name'] }}</td>
                <td>{{ $c['guardian_contact'] }}</td>
                <td>
                    <span class="font-semibold">{{ $c['vaccine_name'] }}</span>
                    <span style="color: #4b5563;">({{ $c['dose_label'] }})</span>
                </td>
                <td><code>{{ $c['batch_number'] }}</code></td>
                <td>{{ $c['administered_by'] }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="10" class="text-center" style="padding: 15px; color: #9ca3af;">
                    No vaccinated children match the selected date, vaccine, or dose filter.
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
