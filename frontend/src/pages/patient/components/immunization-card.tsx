import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import {
    Check,
    CheckCircle2,
    ClipboardList,
    Pencil,
    Plus,
    Printer,
    Save,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type CardRecord = {
    id: number;
    vaccine_id: number;
    dose_number: number;
    date_administered: string;
    source: string;
    remarks: string | null;

    administered_by: {
        id: number;
        name: string;
    } | null;
};

type ImmunizationCardDose = {
    dose_number: number;
    recommended_age: string | null;
    interval: string | null;
    record: CardRecord | null;
};

export type ImmunizationCardVaccine = {
    vaccine_id: number;
    vaccine_name: string;
    category: string;
    required_doses: number;
    doses: ImmunizationCardDose[];
};

type ManualCardDose = {
    dose_number: number;
    recommended_age: string | null;
    date_administered: string | null;
    remarks: string | null;
};

export type ManualCardRow = {
    id: number;
    vaccine_name: string;
    dose_count: number;
    doses: ManualCardDose[];
    remarks: string | null;
};

type ManualCardRowDraft = {
    localKey: string;
    id: number | null;
    vaccineName: string;
    doseCount: number;
    doses: {
        doseNumber: number;
        recommendedAge: string;
        dateAdministered: string;
        remarks: string;
    }[];
    remarks: string;
    dirty: boolean;
};


type CardDraft = {
    vaccineId: number;
    vaccineName: string;
    doseNumber: number;
    recordId: number | null;
    dateAdministered: string;
    source: string;
    remarks: string;
    dirty: boolean;
};


type ImmunizationCardProps = {
    patient: {
        id: number;
        patient_id: string;
        date_of_birth: string;
    };
    patientName: string;
    formattedDateOfBirth: string;
    formattedAge: string;
    immunizationCard: ImmunizationCardVaccine[];
    immunizationCardRows: ManualCardRow[];
    flash?: {
        success?: string;
    };
    errors?: {
        vaccine_id?: string;
        dose_number?: string;
        date_administered?: string;
        source?: string;
        remarks?: string;
        vaccine_name?: string;
        dose_count?: string;
        doses?: string;
        'doses.0.dose_number'?: string;
        'doses.0.recommended_age'?: string;
        'doses.0.date_administered'?: string;
        'doses.0.remarks'?: string;
    };
};

export default function ImmunizationCard({
    patient,
    patientName,
    formattedDateOfBirth,
    formattedAge,
    immunizationCard,
    immunizationCardRows,
    flash,
    errors,
}: ImmunizationCardProps) {
    const [isCardEditing, setIsCardEditing] =
        useState(false);

    const [cardDrafts, setCardDrafts] =
        useState<CardDraft[]>([]);

    const [manualCardRowDrafts, setManualCardRowDrafts] =
        useState<ManualCardRowDraft[]>([]);

    const [savingCard, setSavingCard] =
        useState(false);

    const patientUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/patients/${patient.id}`
            : `/patients/${patient.id}`;

const parseDate = (date: string | null) => {
    if (!date) {
        return null;
    }

    const datePart = date.split('T')[0];
    const parts = datePart.split('-');

    if (parts.length !== 3) {
        return null;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (
        Number.isNaN(year) ||
        Number.isNaN(month) ||
        Number.isNaN(day)
    ) {
        return null;
    }

    const parsed = new Date(
        year,
        month - 1,
        day,
    );

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
};


const formatCompactDate = (
    date: string | null,
) => {
    const parsed = parseDate(date);

    if (!parsed) {
        return '—';
    }

    const month = String(
        parsed.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
        parsed.getDate(),
    ).padStart(2, '0');

    const year = String(
        parsed.getFullYear(),
    ).slice(-2);

    return `${month}/${day}/${year}`;
};

const formatDateForInput = (
    date: string | null,
) => {
    if (!date) {
        return '';
    }

    return date.split('T')[0];
};

const formatInputDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
        date.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getTodayForInput = () => {
    return formatInputDate(new Date());
};


const formatRecommendedAge = (
    age: string | null,
) => {
    if (!age) {
        return '—';
    }

    const normalized = age
        .trim()
        .toLowerCase();

    if (
        normalized === '0 days' ||
        normalized === '0 day' ||
        normalized === 'at birth'
    ) {
        return 'At birth';
    }

    return age
        .replace(
            /(\d+)\.25\b/g,
            '$1¼',
        )
        .replace(
            /(\d+)\.5\b/g,
            '$1½',
        )
        .replace(
            /(\d+)\.50\b/g,
            '$1½',
        )
        .replace(
            /(\d+)\.75\b/g,
            '$1¾',
        );
};


const createManualCardRowDrafts = () => {
    return immunizationCardRows.map(
        (row): ManualCardRowDraft => ({
            localKey: `saved-${row.id}`,
            id: row.id,
            vaccineName: row.vaccine_name,
            doseCount: Math.max(row.dose_count, 1),
            doses: Array.from(
                {
                    length: Math.max(
                        row.dose_count,
                        1,
                    ),
                },
                (_, index) => {
                    const doseNumber =
                        index + 1;

                    const dose =
                        row.doses.find(
                            (item) =>
                                item.dose_number ===
                                doseNumber,
                        );

                    return {
                        doseNumber,
                        recommendedAge:
                            dose?.recommended_age ??
                            '',
                        dateAdministered:
                            formatDateForInput(
                                dose?.date_administered ??
                                    null,
                            ),
                        remarks:
                            dose?.remarks ?? '',
                    };
                },
            ),
            remarks: row.remarks ?? '',
            dirty: false,
        }),
    );
};

const createEmptyManualCardRowDraft = (
    doseCount = 1,
): ManualCardRowDraft => {
    const safeDoseCount = Math.min(
        Math.max(doseCount, 1),
        10,
    );

    return {
        localKey: `new-${Date.now()}-${Math.random()}`,
        id: null,
        vaccineName: '',
        doseCount: safeDoseCount,
        doses: Array.from(
            { length: safeDoseCount },
            (_, index) => ({
                doseNumber: index + 1,
                recommendedAge: '',
                dateAdministered: '',
                remarks: '',
            }),
        ),
        remarks: '',
        dirty: true,
    };
};

const updateManualCardRowDraft = (
    localKey: string,
    updates: Partial<ManualCardRowDraft>,
) => {
    setManualCardRowDrafts((current) =>
        current.map((row) =>
            row.localKey === localKey
                ? {
                      ...row,
                      ...updates,
                      dirty: true,
                  }
                : row,
        ),
    );
};

const updateManualDoseCount = (
    localKey: string,
    doseCount: number,
) => {
    const safeDoseCount = Math.min(
        Math.max(doseCount, 1),
        10,
    );

    setManualCardRowDrafts((current) =>
        current.map((row) => {
            if (row.localKey !== localKey) {
                return row;
            }

            const doses = Array.from(
                { length: safeDoseCount },
                (_, index) => {
                    const existing =
                        row.doses[index];

                    return (
                        existing ?? {
                            doseNumber:
                                index + 1,
                            recommendedAge: '',
                            dateAdministered: '',
                            remarks: '',
                        }
                    );
                },
            ).map((dose, index) => ({
                ...dose,
                doseNumber: index + 1,
            }));

            return {
                ...row,
                doseCount: safeDoseCount,
                doses,
                dirty: true,
            };
        }),
    );
};

const updateManualDose = (
    localKey: string,
    doseNumber: number,
    updates: Partial<
        ManualCardRowDraft['doses'][number]
    >,
) => {
    setManualCardRowDrafts((current) =>
        current.map((row) => {
            if (row.localKey !== localKey) {
                return row;
            }

            return {
                ...row,
                dirty: true,
                doses: row.doses.map((dose) =>
                    dose.doseNumber ===
                    doseNumber
                        ? {
                              ...dose,
                              ...updates,
                          }
                        : dose,
                ),
            };
        }),
    );
};

const handleAddManualCardRow = () => {
    setManualCardRowDrafts((current) => [
        ...current,
        createEmptyManualCardRowDraft(),
    ]);
};

const handleRemoveManualCardRow = (
    row: ManualCardRowDraft,
) => {
    if (!row.id) {
        setManualCardRowDrafts((current) =>
            current.filter(
                (item) =>
                    item.localKey !==
                    row.localKey,
            ),
        );

        return;
    }

    const confirmed = window.confirm(
        `Remove ${row.vaccineName || 'this historical vaccine'} from this patient's immunization card?`,
    );

    if (!confirmed) {
        return;
    }

    router.delete(
        `/patients/${patient.id}/immunization-card-rows/${row.id}`,
        {
            preserveScroll: true,
            onSuccess: () => {
                setManualCardRowDrafts(
                    (current) =>
                        current.filter(
                            (item) =>
                                item.localKey !==
                                row.localKey,
                        ),
                );
            },
        },
    );
};

const createCardDrafts = () => {
    return immunizationCard.flatMap(
        (vaccine) =>
            vaccine.doses.map(
                (dose): CardDraft => ({
                    vaccineId:
                        vaccine.vaccine_id,

                    vaccineName:
                        vaccine.vaccine_name,

                    doseNumber:
                        dose.dose_number,

                    recordId:
                        dose.record?.id ??
                        null,

                    dateAdministered:
                        formatDateForInput(
                            dose.record
                                ?.date_administered ??
                                null,
                        ),

                    source:
                        dose.record
                            ?.source ??
                        'manual',

                    remarks:
                        dose.record
                            ?.remarks ??
                        '',

                    dirty: false,
                }),
            ),
    );
};

useEffect(() => {
    if (!isCardEditing) {
        setCardDrafts(
            createCardDrafts(),
        );

        setManualCardRowDrafts(
            createManualCardRowDrafts(),
        );
    }
}, [immunizationCard, immunizationCardRows]);

const handleStartCardEdit = () => {
    setCardDrafts(
        createCardDrafts(),
    );

    setManualCardRowDrafts(
        createManualCardRowDrafts(),
    );

    setIsCardEditing(true);
};

const handleCancelCardEdit = () => {
    setCardDrafts(
        createCardDrafts(),
    );

    setManualCardRowDrafts(
        createManualCardRowDrafts(),
    );

    setIsCardEditing(false);
    setSavingCard(false);
};

const getDraft = (
    vaccineId: number,
    doseNumber: number,
) => {
    return cardDrafts.find(
        (draft) =>
            draft.vaccineId ===
                vaccineId &&
            draft.doseNumber ===
                doseNumber,
    );
};

const updateDraft = (
    vaccineId: number,
    doseNumber: number,
    updates: Partial<CardDraft>,
) => {
    setCardDrafts((current) =>
        current.map((draft) => {
            if (
                draft.vaccineId !==
                    vaccineId ||
                draft.doseNumber !==
                    doseNumber
            ) {
                return draft;
            }

            return {
                ...draft,
                ...updates,
                dirty: true,
            };
        }),
    );
};

const getVaccineRemarks = (
    vaccine: ImmunizationCardVaccine,
) => {
    const remarks = vaccine.doses
        .filter(
            (dose) =>
                Boolean(
                    dose.record
                        ?.remarks,
                ),
        )
        .map(
            (dose) =>
                `D${dose.dose_number}: ${dose.record?.remarks}`,
        );

    if (remarks.length === 0) {
        return '—';
    }

    return remarks.join(' • ');
};

const handleSaveCard = () => {
    if (savingCard) {
        return;
    }

    const changedDrafts =
        cardDrafts.filter(
            (draft) => draft.dirty,
        );

    const changedManualRows =
        manualCardRowDrafts.filter(
            (row) => row.dirty,
        );

    const invalidDraft =
        changedDrafts.find(
            (draft) =>
                !draft.dateAdministered ||
                !draft.source.trim(),
        );

    if (invalidDraft) {
        window.alert(
            `${invalidDraft.vaccineName} Dose ${invalidDraft.doseNumber} needs a vaccination date before it can be saved.`,
        );

        return;
    }

    const invalidManualRow =
        changedManualRows.find(
            (row) =>
                !row.vaccineName.trim(),
        );

    if (invalidManualRow) {
        window.alert(
            'Every added historical row needs a vaccine name before it can be saved.',
        );

        return;
    }

    if (
        changedDrafts.length === 0 &&
        changedManualRows.length === 0
    ) {
        setIsCardEditing(false);
        return;
    }

    setSavingCard(true);

    const finishSaving = () => {
        setSavingCard(false);
        setIsCardEditing(false);

        router.reload({
            only: [
                'patient',
                'vaccinationOptions',
                'immunizationCard',
                'immunizationCardRows',
                'flash',
                'errors',
            ],
        });
    };

    const saveManualRow = (
        index: number,
    ) => {
        if (
            index >=
            changedManualRows.length
        ) {
            finishSaving();
            return;
        }

        const row =
            changedManualRows[index];

        const data = {
            vaccine_name:
                row.vaccineName.trim(),
            dose_count: row.doseCount,
            doses: row.doses.map(
                (dose) => ({
                    dose_number:
                        dose.doseNumber,
                    recommended_age:
                        dose.recommendedAge.trim() ||
                        null,
                    date_administered:
                        dose.dateAdministered ||
                        null,
                    remarks:
                        dose.remarks.trim() ||
                        null,
                }),
            ),
            remarks:
                row.remarks.trim() ||
                null,
        };

        const options = {
            preserveScroll: true,

            onSuccess: () => {
                saveManualRow(index + 1);
            },

            onError: () => {
                setSavingCard(false);
            },
        };

        if (row.id) {
            router.put(
                `/patients/${patient.id}/immunization-card-rows/${row.id}`,
                data,
                options,
            );

            return;
        }

        router.post(
            `/patients/${patient.id}/immunization-card-rows`,
            data,
            options,
        );
    };

    const saveStructuredDraft = (
        index: number,
    ) => {
        if (
            index >=
            changedDrafts.length
        ) {
            saveManualRow(0);
            return;
        }

        const draft =
            changedDrafts[index];

        const data = {
            date_administered:
                draft.dateAdministered,

            source:
                draft.source.trim(),

            remarks:
                draft.remarks.trim() ||
                null,
        };

        const options = {
            preserveScroll: true,

            onSuccess: () => {
                saveStructuredDraft(
                    index + 1,
                );
            },

            onError: () => {
                setSavingCard(false);
            },
        };

        if (draft.recordId) {
            router.put(
                `/patients/${patient.id}/immunization-records/${draft.recordId}`,
                data,
                options,
            );

            return;
        }

        router.post(
            `/patients/${patient.id}/immunization-records`,
            {
                vaccine_id:
                    draft.vaccineId,

                dose_number:
                    draft.doseNumber,

                ...data,
            },
            options,
        );
    };

    saveStructuredDraft(0);
};

    const totalPrintRows = Math.max(
        immunizationCard.length + manualCardRowDrafts.length,
        1,
    );

    const printStyleVars: React.CSSProperties = {
        ['--print-row-count' as any]: totalPrintRows,
        ['--print-title-size' as any]:
            totalPrintRows <= 7
                ? '16px'
                : totalPrintRows <= 10
                  ? '14px'
                  : '12px',
        ['--print-sub-size' as any]:
            totalPrintRows <= 7 ? '8px' : '7px',
        ['--print-patient-font-size' as any]:
            totalPrintRows <= 7
                ? '9px'
                : totalPrintRows <= 10
                  ? '8px'
                  : '7px',
        ['--print-header-pad' as any]:
            totalPrintRows <= 7
                ? '2px 4px 4px 4px'
                : totalPrintRows <= 10
                  ? '1px 4px 2px 4px'
                  : '1px 3px 1px 3px',
        ['--print-qr-size' as any]:
            totalPrintRows <= 7
                ? '48px'
                : totalPrintRows <= 10
                  ? '40px'
                  : '34px',
        ['--print-qr-pad' as any]: totalPrintRows <= 7 ? '3px' : '2px',
        ['--print-th-size' as any]:
            totalPrintRows <= 7
                ? '8.5px'
                : totalPrintRows <= 10
                  ? '7.5px'
                  : '6.5px',
        ['--print-th-pad' as any]:
            totalPrintRows <= 7
                ? '2px 3px'
                : totalPrintRows <= 10
                  ? '1.5px 2px'
                  : '1px 2px',
        ['--print-td-size' as any]:
            totalPrintRows <= 7
                ? '8px'
                : totalPrintRows <= 10
                  ? '7px'
                  : totalPrintRows <= 14
                    ? '6px'
                    : '5px',
        ['--print-td-pad' as any]:
            totalPrintRows <= 7
                ? '1px 2px'
                : totalPrintRows <= 10
                  ? '0.5px 1.5px'
                  : '0.5px 1px',
        ['--print-sig-mt' as any]:
            totalPrintRows <= 7
                ? '6px'
                : totalPrintRows <= 10
                  ? '3px'
                  : '2px',
        ['--print-sig-pt' as any]:
            totalPrintRows <= 7
                ? '3px'
                : totalPrintRows <= 10
                  ? '2px'
                  : '1px',
        ['--print-sig-size' as any]:
            totalPrintRows <= 7
                ? '8px'
                : totalPrintRows <= 10
                  ? '7px'
                  : '6px',
        ['--print-footer-size' as any]:
            totalPrintRows <= 7 ? '7px' : '6px',
        ['--print-footer-mt' as any]:
            totalPrintRows <= 7 ? '3px' : '1px',
    };

    return (
        <Card className="immunization-print-area" style={printStyleVars}>
            <style>{`
                .print-only {
                    display: none;
                }

                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 4mm 6mm;
                    }

                    html, body {
                        height: 100% !important;
                        max-height: 100% !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    .immunization-print-area,
                    .immunization-print-area * {
                        visibility: visible !important;
                    }

                    .immunization-print-area {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        right: 0 !important;
                        bottom: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-height: 100% !important;
                        box-sizing: border-box !important;
                        border: 0 !important;
                        box-shadow: none !important;
                        background: #fff !important;
                        color: #000 !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        page-break-inside: avoid !important;
                        page-break-after: avoid !important;
                        break-inside: avoid !important;
                        break-after: avoid !important;
                        overflow: hidden !important;
                        padding: 0 !important;
                    }

                    .immunization-print-area .no-print {
                        display: none !important;
                    }

                    .immunization-print-area .print-only {
                        display: block !important;
                    }

                    .immunization-print-area .print-header-container {
                        flex-shrink: 0 !important;
                        border-bottom: 2px solid #000 !important;
                        padding: var(--print-header-pad, 2px 4px 4px 4px) !important;
                    }

                    .immunization-print-area .print-header-grid {
                        display: grid !important;
                        grid-template-columns: 1fr auto !important;
                        gap: 16px !important;
                        align-items: center !important;
                    }

                    .immunization-print-area .print-header-title {
                        font-size: var(--print-title-size, 16px) !important;
                        font-weight: 700 !important;
                        margin: 0 !important;
                        line-height: 1.15 !important;
                    }

                    .immunization-print-area .print-header-sub {
                        font-size: var(--print-sub-size, 8px) !important;
                        letter-spacing: 0.15em !important;
                        font-weight: 600 !important;
                        text-transform: uppercase !important;
                        margin: 0 !important;
                    }

                    .immunization-print-area .print-patient-grid {
                        margin-top: 3px !important;
                        display: grid !important;
                        grid-template-columns: repeat(4, auto) !important;
                        justify-content: space-between !important;
                        gap: 8px !important;
                        font-size: var(--print-patient-font-size, 9px) !important;
                        line-height: 1.2 !important;
                    }

                    .immunization-print-area .print-qr-box {
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: center !important;
                        border: 1px solid #000 !important;
                        padding: var(--print-qr-pad, 3px) !important;
                        background: #fff !important;
                        flex-shrink: 0 !important;
                    }

                    .immunization-print-area .print-qr-box svg {
                        display: block !important;
                        width: var(--print-qr-size, 48px) !important;
                        height: var(--print-qr-size, 48px) !important;
                    }

                    .immunization-print-area .print-qr-box p {
                        font-size: 6.5px !important;
                        line-height: 1 !important;
                        margin: 1px 0 0 0 !important;
                    }

                    .immunization-print-area .immunization-table-wrapper {
                        display: flex !important;
                        flex-direction: column !important;
                        flex: 1 1 auto !important;
                        min-height: 0 !important;
                        overflow: hidden !important;
                        border: 1.5px solid #000 !important;
                        border-radius: 0 !important;
                        margin: 1px 0 !important;
                    }

                    .immunization-print-area table {
                        min-width: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        border-collapse: collapse !important;
                        table-layout: fixed !important;
                        color: #000 !important;
                        font-size: var(--print-td-size, 8px) !important;
                    }

                    .immunization-print-area thead {
                        flex-shrink: 0 !important;
                        display: table-header-group !important;
                    }

                    .immunization-print-area thead tr {
                        border-bottom: 1.5px solid #000 !important;
                        background: #f3f4f6 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .immunization-print-area th {
                        border-right: 1px solid #000 !important;
                        border-color: #000 !important;
                        padding: var(--print-th-pad, 2px 3px) !important;
                        font-size: var(--print-th-size, 8.5px) !important;
                        font-weight: 700 !important;
                        text-align: center !important;
                        line-height: 1.15 !important;
                        background: #f3f4f6 !important;
                    }

                    .immunization-print-area th:last-child {
                        border-right: 0 !important;
                    }

                    .immunization-print-area tbody {
                        display: table-row-group !important;
                        height: 100% !important;
                    }

                    .immunization-print-area tbody tr {
                        border-bottom: 1px solid #000 !important;
                        height: calc(100% / var(--print-row-count, 7)) !important;
                        max-height: calc(100% / var(--print-row-count, 7)) !important;
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }

                    .immunization-print-area tbody tr:last-child {
                        border-bottom: 0 !important;
                    }

                    .immunization-print-area td {
                        border-right: 1px solid #000 !important;
                        border-color: #000 !important;
                        padding: var(--print-td-pad, 1px 2px) !important;
                        font-size: var(--print-td-size, 8px) !important;
                        line-height: 1.15 !important;
                        vertical-align: middle !important;
                        height: inherit !important;
                    }

                    .immunization-print-area td:last-child {
                        border-right: 0 !important;
                    }

                    .immunization-print-area td > div,
                    .immunization-print-area td [class*="min-h-"] {
                        min-height: 0 !important;
                        height: 100% !important;
                        padding-top: 1px !important;
                        padding-bottom: 1px !important;
                    }

                    .immunization-print-area .text-sm {
                        font-size: var(--print-td-size, 8px) !important;
                        line-height: 1.15 !important;
                    }

                    .immunization-print-area .text-xs {
                        font-size: calc(var(--print-td-size, 8px) * 0.9) !important;
                        line-height: 1.1 !important;
                    }

                    .immunization-print-area .text-base {
                        font-size: var(--print-td-size, 8px) !important;
                    }

                    .immunization-print-area [class*="text-[10px]"] {
                        font-size: calc(var(--print-td-size, 8px) * 0.8) !important;
                    }

                    .immunization-print-area .text-muted-foreground {
                        color: #333 !important;
                    }

                    .immunization-print-area .badge,
                    .immunization-print-area [class*="Badge"] {
                        border-color: #555 !important;
                        padding: 0 2px !important;
                        font-size: calc(var(--print-td-size, 8px) * 0.8) !important;
                        margin-top: 1px !important;
                    }

                    .immunization-print-area .print-signatures-container {
                        flex-shrink: 0 !important;
                        margin-top: var(--print-sig-mt, 6px) !important;
                        padding: 0 12px 2px 12px !important;
                    }

                    .immunization-print-area .print-signatures-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 48px !important;
                        text-align: center !important;
                        font-size: var(--print-sig-size, 8px) !important;
                    }

                    .immunization-print-area .print-signature-line {
                        border-top: 1px solid #000 !important;
                        padding-top: var(--print-sig-pt, 3px) !important;
                    }

                    .immunization-print-area .print-footer-text {
                        margin-top: var(--print-footer-mt, 3px) !important;
                        text-align: center !important;
                        font-size: var(--print-footer-size, 7px) !important;
                        color: #555 !important;
                    }
                }
            `}</style>

            <div className="print-only border-b-2 border-black px-4 pb-2 pt-1 print-header-container">
                <div className="print-header-grid">
                    <div>
                        <div className="text-center">
                            <p className="print-header-sub">
                                Barangay Bugo Health Center
                            </p>

                            <h1 className="print-header-title">
                                Child Immunization Record
                            </h1>
                        </div>

                        <div className="print-patient-grid">
                            <div>
                                <span className="font-semibold">Patient:</span>{' '}
                                {patientName}
                            </div>

                            <div>
                                <span className="font-semibold">Patient ID:</span>{' '}
                                {patient.patient_id}
                            </div>

                            <div>
                                <span className="font-semibold">Date of Birth:</span>{' '}
                                {formattedDateOfBirth}
                            </div>

                            <div>
                                <span className="font-semibold">Age:</span>{' '}
                                {formattedAge}
                            </div>
                        </div>
                    </div>

                    <div className="print-qr-box">
                        <QRCodeSVG
                            value={patientUrl}
                            size={48}
                            level="H"
                            marginSize={1}
                            title={`${patientName} - ${patient.patient_id}`}
                        />

                        <p className="font-semibold">
                            Scan Patient Record
                        </p>

                        <p>
                            {patient.patient_id}
                        </p>
                    </div>
                </div>
            </div>

            <CardHeader className="no-print border-b p-3.5 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-base sm:text-lg">
                            Child Immunization Record
                        </CardTitle>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Digital vaccination card based on the patient's applicable vaccine schedule.
                        </p>
                    </div>

                    {!isCardEditing ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs flex-1 sm:flex-initial"
                                onClick={() => window.print()}
                            >
                                <Printer className="mr-1.5 h-3.5 w-3.5" />
                                Print Card
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs flex-1 sm:flex-initial"
                                onClick={handleStartCardEdit}
                            >
                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                Edit Card
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs flex-1 sm:flex-initial"
                                disabled={savingCard}
                                onClick={handleCancelCardEdit}
                            >
                                <X className="mr-1.5 h-3.5 w-3.5" />
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                className="h-8 text-xs flex-1 sm:flex-initial"
                                disabled={savingCard}
                                onClick={handleSaveCard}
                            >
                                <Save className="mr-1.5 h-3.5 w-3.5" />
                                {savingCard ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-3 sm:pt-5">
                {flash?.success && (
                    <div className="no-print flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />

                        <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            {
                                flash.success
                            }
                        </p>
                    </div>
                )}

                {(errors?.vaccine_id ||
                    errors?.dose_number ||
                    errors?.date_administered ||
                    errors?.source ||
                    errors?.remarks ||
                    errors?.vaccine_name ||
                    errors?.dose_count ||
                    errors?.doses ||
                    errors?.['doses.0.date_administered']) && (
                    <div className="no-print rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-600 dark:text-red-400">
                        {errors.vaccine_id && (
                            <p>
                                {
                                    errors.vaccine_id
                                }
                            </p>
                        )}

                        {errors.dose_number && (
                            <p>
                                {
                                    errors.dose_number
                                }
                            </p>
                        )}

                        {errors.date_administered && (
                            <p>
                                {
                                    errors.date_administered
                                }
                            </p>
                        )}

                        {errors.source && (
                            <p>
                                {
                                    errors.source
                                }
                            </p>
                        )}

                        {errors.remarks && (
                            <p>
                                {
                                    errors.remarks
                                }
                            </p>
                        )}

                        {errors.vaccine_name && (
                            <p>
                                {
                                    errors.vaccine_name
                                }
                            </p>
                        )}

                        {errors.dose_count && (
                            <p>
                                {
                                    errors.dose_count
                                }
                            </p>
                        )}

                        {errors.doses && (
                            <p>
                                {
                                    errors.doses
                                }
                            </p>
                        )}

                        {errors?.['doses.0.date_administered'] && (
                            <p>
                                {
                                    errors[
                                        'doses.0.date_administered'
                                    ]
                                }
                            </p>
                        )}
                    </div>
                )}

                {immunizationCard.length ===
                0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />

                        <p className="mt-3 font-medium">
                            No applicable
                            vaccines found.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card List (< md, view mode) */}
                        {!isCardEditing && (
                            <div className="block md:hidden no-print space-y-3">
                                {immunizationCard.map((vaccine) => {
                                    const completedDoses = vaccine.doses.filter(
                                        (d) => Boolean(d.record),
                                    ).length;
                                    const totalDoses =
                                        vaccine.required_doses ||
                                        vaccine.doses.length;
                                    const isAllCompleted =
                                        completedDoses >= totalDoses &&
                                        totalDoses > 0;

                                    return (
                                        <div
                                            key={`mobile-vaccine-${vaccine.vaccine_id}`}
                                            className="rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between border-b bg-muted/40 px-3.5 py-2.5">
                                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                    <span className="font-bold text-sm text-foreground truncate">
                                                        {vaccine.vaccine_name}
                                                    </span>
                                                    {vaccine.category !==
                                                        'routine' && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] py-0 px-1.5 capitalize shrink-0"
                                                        >
                                                            {vaccine.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="shrink-0 ml-2">
                                                    {isAllCompleted ? (
                                                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5">
                                                            Completed
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-[11px] font-medium text-muted-foreground">
                                                            {completedDoses}/
                                                            {totalDoses}{' '}
                                                            {totalDoses === 1
                                                                ? 'dose'
                                                                : 'doses'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="divide-y divide-border/60">
                                                {vaccine.doses.map((dose) => {
                                                    const isDone = Boolean(
                                                        dose.record,
                                                    );
                                                    const targetAge =
                                                        formatRecommendedAge(
                                                            dose.recommended_age,
                                                        );

                                                    return (
                                                        <div
                                                            key={`mobile-dose-${vaccine.vaccine_id}-${dose.dose_number}`}
                                                            className={`p-3 space-y-1.5 transition-colors ${
                                                                isDone
                                                                    ? 'bg-emerald-500/[0.03]'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground border shrink-0">
                                                                        Dose{' '}
                                                                        {
                                                                            dose.dose_number
                                                                        }
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground truncate">
                                                                        Age:{' '}
                                                                        <span className="font-medium text-foreground">
                                                                            {
                                                                                targetAge
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                </div>

                                                                <div className="shrink-0">
                                                                    {isDone ? (
                                                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                                            <Check className="h-3 w-3 stroke-[2.5]" />
                                                                            {formatCompactDate(
                                                                                dose
                                                                                    .record
                                                                                    ?.date_administered ??
                                                                                    null,
                                                                            )}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground/80 italic">
                                                                            Not
                                                                            yet
                                                                            given
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {dose.record
                                                                ?.remarks && (
                                                                <p className="text-[11px] text-muted-foreground italic bg-muted/40 rounded px-2 py-1">
                                                                    Note:{' '}
                                                                    {
                                                                        dose
                                                                            .record
                                                                            .remarks
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {manualCardRowDrafts.map((row) => {
                                    const completedManualDoses =
                                        row.doses.filter((d) =>
                                            Boolean(d.dateAdministered),
                                        ).length;
                                    const totalManualDoses = row.doseCount;
                                    const isAllCompleted =
                                        completedManualDoses >=
                                            totalManualDoses &&
                                        totalManualDoses > 0;

                                    return (
                                        <div
                                            key={`mobile-manual-row-${row.localKey}`}
                                            className="rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between border-b bg-muted/40 px-3.5 py-2.5">
                                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                    <span className="font-bold text-sm text-foreground truncate">
                                                        {row.vaccineName ||
                                                            'Historical Vaccine'}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] py-0 px-1.5 shrink-0"
                                                    >
                                                        Historical
                                                    </Badge>
                                                </div>
                                                <div className="shrink-0 ml-2">
                                                    {isAllCompleted ? (
                                                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5">
                                                            Completed
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-[11px] font-medium text-muted-foreground">
                                                            {
                                                                completedManualDoses
                                                            }
                                                            /{totalManualDoses}{' '}
                                                            {totalManualDoses ===
                                                            1
                                                                ? 'dose'
                                                                : 'doses'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="divide-y divide-border/60">
                                                {row.doses.map((dose) => {
                                                    const isDone = Boolean(
                                                        dose.dateAdministered,
                                                    );
                                                    const targetAge =
                                                        formatRecommendedAge(
                                                            dose.recommendedAge ||
                                                                null,
                                                        );

                                                    return (
                                                        <div
                                                            key={`mobile-manual-dose-${row.localKey}-${dose.doseNumber}`}
                                                            className={`p-3 space-y-1.5 transition-colors ${
                                                                isDone
                                                                    ? 'bg-emerald-500/[0.03]'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground border shrink-0">
                                                                        Dose{' '}
                                                                        {
                                                                            dose.doseNumber
                                                                        }
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground truncate">
                                                                        Age:{' '}
                                                                        <span className="font-medium text-foreground">
                                                                            {
                                                                                targetAge
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                </div>

                                                                <div className="shrink-0">
                                                                    {isDone ? (
                                                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                                            <Check className="h-3 w-3 stroke-[2.5]" />
                                                                            {formatCompactDate(
                                                                                dose.dateAdministered,
                                                                            )}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground/80 italic">
                                                                            Not
                                                                            yet
                                                                            given
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {dose.remarks && (
                                                                <p className="text-[11px] text-muted-foreground italic bg-muted/40 rounded px-2 py-1">
                                                                    Note:{' '}
                                                                    {
                                                                        dose.remarks
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {row.remarks && (
                                                <div className="border-t bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                                                    <span className="font-semibold text-foreground">
                                                        Remarks:{' '}
                                                    </span>
                                                    {row.remarks}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Mobile Edit Card List (< md, edit mode) */}
                        {isCardEditing && (
                            <div className="block md:hidden no-print space-y-3">
                                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-xs text-primary flex items-center justify-between">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Pencil className="h-3.5 w-3.5 shrink-0" />
                                        <span>Editing Immunization Card</span>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">
                                        Mobile Mode
                                    </span>
                                </div>

                                {immunizationCard.map((vaccine) => (
                                    <div
                                        key={`mobile-edit-vaccine-${vaccine.vaccine_id}`}
                                        className="rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between border-b bg-muted/40 px-3.5 py-2.5">
                                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                <span className="font-bold text-sm text-foreground truncate">
                                                    {vaccine.vaccine_name}
                                                </span>
                                                {vaccine.category !==
                                                    'routine' && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] py-0 px-1.5 capitalize shrink-0"
                                                    >
                                                        {vaccine.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                                                {vaccine.required_doses}{' '}
                                                {vaccine.required_doses === 1
                                                    ? 'dose'
                                                    : 'doses'}
                                            </span>
                                        </div>

                                        <div className="divide-y divide-border/60 p-3 space-y-3">
                                            {vaccine.doses.map((dose) => {
                                                const draft = getDraft(
                                                    vaccine.vaccine_id,
                                                    dose.dose_number,
                                                );
                                                const targetAge =
                                                    formatRecommendedAge(
                                                        dose.recommended_age,
                                                    );

                                                return (
                                                    <div
                                                        key={`mobile-edit-dose-${vaccine.vaccine_id}-${dose.dose_number}`}
                                                        className="space-y-2 pt-2 first:pt-0"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground border">
                                                                Dose{' '}
                                                                {
                                                                    dose.dose_number
                                                                }
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                Target:{' '}
                                                                <span className="font-medium text-foreground">
                                                                    {
                                                                        targetAge
                                                                    }
                                                                </span>
                                                            </span>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <div>
                                                                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                                                                    Date Administered (Petsa)
                                                                </label>
                                                                <Input
                                                                    type="date"
                                                                    className="h-9 text-xs w-full"
                                                                    value={
                                                                        draft?.dateAdministered ??
                                                                        ''
                                                                    }
                                                                    min={formatDateForInput(
                                                                        patient.date_of_birth,
                                                                    )}
                                                                    max={getTodayForInput()}
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateDraft(
                                                                            vaccine.vaccine_id,
                                                                            dose.dose_number,
                                                                            {
                                                                                dateAdministered:
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                        )
                                                                    }
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                                                                    Remarks (Optional)
                                                                </label>
                                                                <Input
                                                                    type="text"
                                                                    placeholder="e.g. Batch #, site, reactions"
                                                                    maxLength={
                                                                        1000
                                                                    }
                                                                    className="h-8 text-xs w-full"
                                                                    value={
                                                                        draft?.remarks ??
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateDraft(
                                                                            vaccine.vaccine_id,
                                                                            dose.dose_number,
                                                                            {
                                                                                remarks:
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                            },
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {manualCardRowDrafts.map((row) => (
                                    <div
                                        key={`mobile-edit-manual-row-${row.localKey}`}
                                        className="rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden"
                                    >
                                        <div className="border-b bg-muted/40 p-3 space-y-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    Historical Vaccine
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-500/10 px-2"
                                                    disabled={
                                                        savingCard
                                                    }
                                                    onClick={() =>
                                                        handleRemoveManualCardRow(
                                                            row,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="mr-1 h-3 w-3" />
                                                    Remove
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_80px] gap-2">
                                                <div>
                                                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                                                        Vaccine Name
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        value={
                                                            row.vaccineName
                                                        }
                                                        placeholder="Vaccine name"
                                                        maxLength={
                                                            255
                                                        }
                                                        className="h-9 text-xs"
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updateManualCardRowDraft(
                                                                row.localKey,
                                                                {
                                                                    vaccineName:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                },
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                                                        Doses (1-10)
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={10}
                                                        value={
                                                            row.doseCount
                                                        }
                                                        className="h-9 text-xs text-center"
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updateManualDoseCount(
                                                                row.localKey,
                                                                Number(
                                                                    event
                                                                        .target
                                                                        .value,
                                                                ) ||
                                                                    1,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="divide-y divide-border/60 p-3 space-y-3">
                                            {row.doses.map((dose) => (
                                                <div
                                                    key={`mobile-edit-manual-dose-${row.localKey}-${dose.doseNumber}`}
                                                    className="space-y-2 pt-2 first:pt-0"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground border">
                                                            Dose{' '}
                                                            {
                                                                dose.doseNumber
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <div>
                                                            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                                                                Recommended Age
                                                            </label>
                                                            <Input
                                                                type="text"
                                                                placeholder="e.g. 9 months"
                                                                maxLength={
                                                                    100
                                                                }
                                                                className="h-8 text-xs w-full"
                                                                value={
                                                                    dose.recommendedAge
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateManualDose(
                                                                        row.localKey,
                                                                        dose.doseNumber,
                                                                        {
                                                                            recommendedAge:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                                                                Date Administered
                                                            </label>
                                                            <Input
                                                                type="date"
                                                                className="h-9 text-xs w-full"
                                                                value={
                                                                    dose.dateAdministered
                                                                }
                                                                min={formatDateForInput(
                                                                    patient.date_of_birth,
                                                                )}
                                                                max={getTodayForInput()}
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateManualDose(
                                                                        row.localKey,
                                                                        dose.doseNumber,
                                                                        {
                                                                            dateAdministered:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                                                                Remarks
                                                            </label>
                                                            <Input
                                                                type="text"
                                                                placeholder="Remarks"
                                                                maxLength={
                                                                    1000
                                                                }
                                                                className="h-8 text-xs w-full"
                                                                value={
                                                                    dose.remarks
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateManualDose(
                                                                        row.localKey,
                                                                        dose.doseNumber,
                                                                        {
                                                                            remarks:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Desktop & Print Table */}
                        <div className="hidden md:block print:block overflow-x-auto rounded-lg border-2 immunization-table-wrapper">
                        <table
                            className={
                                isCardEditing
                                    ? 'w-full min-w-[1240px] table-fixed border-collapse text-sm'
                                    : 'w-full min-w-[980px] table-fixed border-collapse text-sm'
                            }
                        >
                            <thead>
                                <tr className="border-b-2 bg-muted/40">
                                    <th className="w-[17%] border-r-2 px-3 py-3 text-center font-bold">
                                        Bakuna
                                    </th>

                                    <th className="w-[7%] border-r-2 px-2 py-3 text-center font-bold">
                                        Doses
                                    </th>

                                    <th className="w-[20%] border-r-2 px-3 py-3 text-center font-bold">
                                        Recommended
                                        Age
                                    </th>

                                    <th className="w-[38%] border-r-2 px-3 py-3 text-center font-bold">
                                        <span className="block">
                                            Petsa
                                            ng
                                            Bakuna
                                        </span>

                                        <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                                            MM/DD/YY
                                        </span>
                                    </th>

                                    <th className="w-[18%] px-3 py-3 text-center font-bold">
                                        Remarks
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {immunizationCard.map(
                                    (
                                        vaccine,
                                    ) => (
                                        <tr
                                            key={
                                                vaccine.vaccine_id
                                            }
                                            className="border-b-2 last:border-b-0"
                                        >
                                            {/* Vaccine */}
                                            <td className="border-r-2 px-3 py-4 text-center align-middle">
                                                <p className="font-bold">
                                                    {
                                                        vaccine.vaccine_name
                                                    }
                                                </p>

                                                {vaccine.category !==
                                                    'routine' && (
                                                    <Badge
                                                        variant="outline"
                                                        className="mt-2 capitalize"
                                                    >
                                                        {
                                                            vaccine.category
                                                        }
                                                    </Badge>
                                                )}
                                            </td>

                                            {/* Dose Count */}
                                            <td className="border-r-2 px-2 py-4 text-center align-middle">
                                                <span className="text-base font-bold">
                                                    {
                                                        vaccine.required_doses
                                                    }
                                                </span>
                                            </td>

                                            {/* Recommended Age */}
                                            <td className="border-r-2 p-0 align-stretch">
                                                <div
                                                    className="grid h-full"
                                                    style={{
                                                        gridTemplateColumns: `repeat(${Math.max(
                                                            vaccine
                                                                .doses
                                                                .length,
                                                            1,
                                                        )}, minmax(0, 1fr))`,
                                                    }}
                                                >
                                                    {vaccine.doses.map(
                                                        (
                                                            dose,
                                                        ) => (
                                                            <div
                                                                key={`age-${vaccine.vaccine_id}-${dose.dose_number}`}
                                                                className={`relative flex min-w-0 items-center justify-center border-r-2 px-2 text-center last:border-r-0 ${
                                                                    isCardEditing
                                                                        ? 'min-h-[78px]'
                                                                        : 'min-h-[72px]'
                                                                }`}
                                                            >
                                                                <span className="absolute left-1.5 top-1 text-[10px] font-bold text-muted-foreground">
                                                                    {
                                                                        dose.dose_number
                                                                    }
                                                                </span>

                                                                <span className="text-sm font-medium leading-5 text-muted-foreground">
                                                                    {formatRecommendedAge(
                                                                        dose.recommended_age,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </td>

                                            {/* Vaccine Dates */}
                                            <td className="border-r-2 p-0 align-stretch">
                                                <div
                                                    className="grid h-full"
                                                    style={{
                                                        gridTemplateColumns: `repeat(${Math.max(
                                                            vaccine
                                                                .doses
                                                                .length,
                                                            1,
                                                        )}, minmax(0, 1fr))`,
                                                    }}
                                                >
                                                    {vaccine.doses.map(
                                                        (
                                                            dose,
                                                        ) => {
                                                            const draft =
                                                                getDraft(
                                                                    vaccine.vaccine_id,
                                                                    dose.dose_number,
                                                                );

                                                            return (
                                                                <div
                                                                    key={`${vaccine.vaccine_id}-${dose.dose_number}`}
                                                                    className={`relative flex min-w-0 flex-col justify-center border-r-2 last:border-r-0 ${
                                                                        isCardEditing
                                                                            ? 'min-h-[78px] px-2.5 py-3'
                                                                            : 'min-h-[72px] px-2 py-3'
                                                                    }`}
                                                                >
                                                                    <span className="absolute left-1.5 top-1 text-[10px] font-bold text-muted-foreground">
                                                                        {
                                                                            dose.dose_number
                                                                        }
                                                                    </span>

                                                                    {!isCardEditing ? (
                                                                        <span
                                                                            className={`text-center ${
                                                                                dose.record
                                                                                    ? 'font-semibold'
                                                                                    : 'text-muted-foreground'
                                                                            }`}
                                                                        >
                                                                            {dose.record
                                                                                ? formatCompactDate(
                                                                                      dose
                                                                                          .record
                                                                                          .date_administered,
                                                                                  )
                                                                                : '—'}
                                                                        </span>
                                                                    ) : (
                                                                        <Input
                                                                            type="date"
                                                                            className="h-9 w-full min-w-[132px] px-2 text-xs"
                                                                            value={
                                                                                draft?.dateAdministered ??
                                                                                ''
                                                                            }
                                                                            min={formatDateForInput(
                                                                                patient.date_of_birth,
                                                                            )}
                                                                            max={getTodayForInput()}
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                updateDraft(
                                                                                    vaccine.vaccine_id,
                                                                                    dose.dose_number,
                                                                                    {
                                                                                        dateAdministered:
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                    },
                                                                                )
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </td>

                                            {/* Remarks */}
                                            <td className="px-3 py-3 align-middle">
                                                {!isCardEditing ? (
                                                    <p
                                                        className={
                                                            getVaccineRemarks(
                                                                vaccine,
                                                            ) ===
                                                            '—'
                                                                ? 'text-center text-muted-foreground'
                                                                : 'text-xs leading-5'
                                                        }
                                                    >
                                                        {getVaccineRemarks(
                                                            vaccine,
                                                        )}
                                                    </p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {vaccine.doses.map(
                                                            (
                                                                dose,
                                                            ) => {
                                                                const draft =
                                                                    getDraft(
                                                                        vaccine.vaccine_id,
                                                                        dose.dose_number,
                                                                    );

                                                                return (
                                                                    <div
                                                                        key={`remark-${vaccine.vaccine_id}-${dose.dose_number}`}
                                                                        className="grid grid-cols-[22px_1fr] items-center gap-1.5"
                                                                    >
                                                                        <span className="text-[10px] font-bold text-muted-foreground">
                                                                            D
                                                                            {
                                                                                dose.dose_number
                                                                            }
                                                                        </span>

                                                                        <Input
                                                                            type="text"
                                                                            className="h-8 min-w-0 px-2 text-xs"
                                                                            value={
                                                                                draft?.remarks ??
                                                                                ''
                                                                            }
                                                                            placeholder="Remarks"
                                                                            maxLength={
                                                                                1000
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                updateDraft(
                                                                                    vaccine.vaccine_id,
                                                                                    dose.dose_number,
                                                                                    {
                                                                                        remarks:
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                    },
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                );
                                                            },
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ),
                                )}

                                {manualCardRowDrafts.map(
                                    (row) => (
                                        <tr
                                            key={
                                                row.localKey
                                            }
                                            className="border-b-2 last:border-b-0"
                                        >
                                            <td className="border-r-2 px-3 py-4 text-center align-middle">
                                                {!isCardEditing ? (
                                                    <div>
                                                        <p className="font-bold">
                                                            {
                                                                row.vaccineName
                                                            }
                                                        </p>

                                                        <Badge
                                                            variant="outline"
                                                            className="mt-2"
                                                        >
                                                            Historical
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Input
                                                            type="text"
                                                            value={
                                                                row.vaccineName
                                                            }
                                                            placeholder="Vaccine name"
                                                            maxLength={
                                                                255
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateManualCardRowDraft(
                                                                    row.localKey,
                                                                    {
                                                                        vaccineName:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                )
                                                            }
                                                        />

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700"
                                                            disabled={
                                                                savingCard
                                                            }
                                                            onClick={() =>
                                                                handleRemoveManualCardRow(
                                                                    row,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="border-r-2 px-2 py-4 text-center align-middle">
                                                {!isCardEditing ? (
                                                    <span className="text-base font-bold">
                                                        {
                                                            row.doseCount
                                                        }
                                                    </span>
                                                ) : (
                                                    <Input
                                                        type="number"
                                                        min={
                                                            1
                                                        }
                                                        max={
                                                            10
                                                        }
                                                        className="mx-auto h-9 w-16 text-center"
                                                        value={
                                                            row.doseCount
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            updateManualDoseCount(
                                                                row.localKey,
                                                                Number(
                                                                    event
                                                                        .target
                                                                        .value,
                                                                ) ||
                                                                    1,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </td>

                                            <td className="border-r-2 p-0 align-stretch">
                                                <div
                                                    className="grid h-full"
                                                    style={{
                                                        gridTemplateColumns: `repeat(${Math.max(
                                                            row
                                                                .doses
                                                                .length,
                                                            1,
                                                        )}, minmax(0, 1fr))`,
                                                    }}
                                                >
                                                    {row.doses.map(
                                                        (
                                                            dose,
                                                        ) => (
                                                            <div
                                                                key={`manual-age-${row.localKey}-${dose.doseNumber}`}
                                                                className={`relative flex min-w-0 items-center justify-center border-r-2 px-2 text-center last:border-r-0 ${
                                                                    isCardEditing
                                                                        ? 'min-h-[78px]'
                                                                        : 'min-h-[72px]'
                                                                }`}
                                                            >
                                                                <span className="absolute left-1.5 top-1 text-[10px] font-bold text-muted-foreground">
                                                                    {
                                                                        dose.doseNumber
                                                                    }
                                                                </span>

                                                                {!isCardEditing ? (
                                                                    <span className="text-sm font-medium leading-5 text-muted-foreground">
                                                                        {formatRecommendedAge(
                                                                            dose.recommendedAge ||
                                                                                null,
                                                                        )}
                                                                    </span>
                                                                ) : (
                                                                    <Input
                                                                        type="text"
                                                                        className="h-9 min-w-0 px-2 text-xs"
                                                                        value={
                                                                            dose.recommendedAge
                                                                        }
                                                                        placeholder="e.g. 2 months"
                                                                        maxLength={
                                                                            100
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            updateManualDose(
                                                                                row.localKey,
                                                                                dose.doseNumber,
                                                                                {
                                                                                    recommendedAge:
                                                                                        event
                                                                                            .target
                                                                                            .value,
                                                                                },
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </td>

                                            <td className="border-r-2 p-0 align-stretch">
                                                <div
                                                    className="grid h-full"
                                                    style={{
                                                        gridTemplateColumns: `repeat(${Math.max(
                                                            row
                                                                .doses
                                                                .length,
                                                            1,
                                                        )}, minmax(0, 1fr))`,
                                                    }}
                                                >
                                                    {row.doses.map(
                                                        (
                                                            dose,
                                                        ) => (
                                                            <div
                                                                key={`manual-date-${row.localKey}-${dose.doseNumber}`}
                                                                className={`relative flex min-w-0 flex-col justify-center border-r-2 last:border-r-0 ${
                                                                    isCardEditing
                                                                        ? 'min-h-[78px] px-2.5 py-3'
                                                                        : 'min-h-[72px] px-2 py-3'
                                                                }`}
                                                            >
                                                                <span className="absolute left-1.5 top-1 text-[10px] font-bold text-muted-foreground">
                                                                    {
                                                                        dose.doseNumber
                                                                    }
                                                                </span>

                                                                {!isCardEditing ? (
                                                                    <span
                                                                        className={`text-center ${
                                                                            dose.dateAdministered
                                                                                ? 'font-semibold'
                                                                                : 'text-muted-foreground'
                                                                        }`}
                                                                    >
                                                                        {dose.dateAdministered
                                                                            ? formatCompactDate(
                                                                                  dose.dateAdministered,
                                                                              )
                                                                            : '—'}
                                                                    </span>
                                                                ) : (
                                                                    <Input
                                                                        type="date"
                                                                        className="h-9 w-full min-w-[132px] px-2 text-xs"
                                                                        value={
                                                                            dose.dateAdministered
                                                                        }
                                                                        min={formatDateForInput(
                                                                            patient.date_of_birth,
                                                                        )}
                                                                        max={getTodayForInput()}
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            updateManualDose(
                                                                                row.localKey,
                                                                                dose.doseNumber,
                                                                                {
                                                                                    dateAdministered:
                                                                                        event
                                                                                            .target
                                                                                            .value,
                                                                                },
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-3 py-3 align-middle">
                                                {!isCardEditing ? (
                                                    <div className="space-y-1 text-xs leading-5">
                                                        {row.doses.some(
                                                            (
                                                                dose,
                                                            ) =>
                                                                Boolean(
                                                                    dose.remarks,
                                                                ),
                                                        ) ? (
                                                            row.doses
                                                                .filter(
                                                                    (
                                                                        dose,
                                                                    ) =>
                                                                        Boolean(
                                                                            dose.remarks,
                                                                        ),
                                                                )
                                                                .map(
                                                                    (
                                                                        dose,
                                                                    ) => (
                                                                        <p
                                                                            key={`manual-view-remark-${row.localKey}-${dose.doseNumber}`}
                                                                        >
                                                                            <span className="font-semibold">
                                                                                D
                                                                                {
                                                                                    dose.doseNumber
                                                                                }
                                                                                :
                                                                            </span>{' '}
                                                                            {
                                                                                dose.remarks
                                                                            }
                                                                        </p>
                                                                    ),
                                                                )
                                                        ) : row.remarks ? (
                                                            <p>
                                                                {
                                                                    row.remarks
                                                                }
                                                            </p>
                                                        ) : (
                                                            <p className="text-center text-muted-foreground">
                                                                —
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {row.doses.map(
                                                            (
                                                                dose,
                                                            ) => (
                                                                <div
                                                                    key={`manual-remark-${row.localKey}-${dose.doseNumber}`}
                                                                    className="grid grid-cols-[22px_1fr] items-center gap-1.5"
                                                                >
                                                                    <span className="text-[10px] font-bold text-muted-foreground">
                                                                        D
                                                                        {
                                                                            dose.doseNumber
                                                                        }
                                                                    </span>

                                                                    <Input
                                                                        type="text"
                                                                        className="h-8 min-w-0 px-2 text-xs"
                                                                        value={
                                                                            dose.remarks
                                                                        }
                                                                        placeholder="Remarks"
                                                                        maxLength={
                                                                            1000
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            updateManualDose(
                                                                                row.localKey,
                                                                                dose.doseNumber,
                                                                                {
                                                                                    remarks:
                                                                                        event
                                                                                            .target
                                                                                            .value,
                                                                                },
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                    </>
                )}

                <div className="print-only print-signatures-container">
                    <div className="print-signatures-grid">
                        <div>
                            <div className="print-signature-line">
                                Parent / Guardian Signature
                            </div>
                        </div>

                        <div>
                            <div className="print-signature-line">
                                Health Worker / Authorized Personnel
                            </div>
                        </div>
                    </div>

                    <p className="print-footer-text">
                        Printed from Barangay Bugo Health Center Pediatric Immunization Management System
                    </p>
                </div>

                {isCardEditing && (
                    <div className="no-print space-y-3">
                        <div className="flex justify-start">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto h-9 text-xs"
                                disabled={savingCard}
                                onClick={handleAddManualCardRow}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Historical Vaccine Row
                            </Button>
                        </div>

                        {/* Mobile bottom Save / Cancel bar */}
                        <div className="flex items-center gap-2 pt-2 border-t md:hidden">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs flex-1"
                                disabled={savingCard}
                                onClick={handleCancelCardEdit}
                            >
                                <X className="mr-1.5 h-3.5 w-3.5" />
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                className="h-9 text-xs flex-1"
                                disabled={savingCard}
                                onClick={handleSaveCard}
                            >
                                <Save className="mr-1.5 h-3.5 w-3.5" />
                                {savingCard ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                )}

                {!isCardEditing && (
                    <div className="no-print rounded-lg border border-dashed px-4 py-3">
                        <p className="text-xs leading-5 text-muted-foreground">
                            This card shows
                            the patient's
                            documented
                            vaccine history.
                            Use Edit
                            Immunization
                            Card when a
                            historical entry
                            needs to be
                            manually
                            documented or
                            corrected.
                        </p>
                    </div>
                )}

                {isCardEditing && (
                    <div className="no-print flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={
                                savingCard
                            }
                            onClick={
                                handleCancelCardEdit
                            }
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            disabled={
                                savingCard
                            }
                            onClick={
                                handleSaveCard
                            }
                        >
                            <Check className="mr-2 h-4 w-4" />

                            {savingCard
                                ? 'Saving...'
                                : 'Save Changes'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
