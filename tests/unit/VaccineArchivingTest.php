<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Vaccine;
use App\Models\VaccineInventory;
use App\Notifications\BatchArchivedNotification;
use PHPUnit\Framework\TestCase;

class VaccineArchivingTest extends TestCase
{
    public function test_batch_archived_notification_contains_correct_audit_and_deep_link_payload(): void
    {
        $vaccine = new Vaccine();
        $vaccine->id = 1;
        $vaccine->name = 'BCG (Bacillus Calmette-Guérin)';

        $batch = new VaccineInventory();
        $batch->id = 42;
        $batch->batch_number = 'BCG-2026-001';
        $batch->quantity = 15;
        $batch->setRelation('vaccine', $vaccine);

        $notification = new BatchArchivedNotification($batch, 'expired');
        $notifiable = new User();

        $databasePayload = $notification->toDatabase($notifiable);

        $this->assertEquals('inventory', $databasePayload['type']);
        $this->assertEquals('Batch Automatically Archived: BCG-2026-001', $databasePayload['title']);
        $this->assertEquals('BCG-2026-001', $databasePayload['batch_number']);
        $this->assertEquals('BCG (Bacillus Calmette-Guérin)', $databasePayload['vaccine_name']);
        $this->assertEquals('Expired', $databasePayload['reason_label']);
        $this->assertEquals('warning', $databasePayload['priority']);
        $this->assertStringContainsString('highlighted_batch_id=42', $databasePayload['url']);
        $this->assertStringContainsString('search=BCG-2026-001', $databasePayload['url']);
    }

    public function test_batch_archived_notification_formats_depleted_reason_correctly(): void
    {
        $vaccine = new Vaccine();
        $vaccine->id = 2;
        $vaccine->name = 'Hepatitis B';

        $batch = new VaccineInventory();
        $batch->id = 99;
        $batch->batch_number = 'HEP-2026-X';
        $batch->quantity = 0;
        $batch->setRelation('vaccine', $vaccine);

        $notification = new BatchArchivedNotification($batch, 'out_of_stock');
        $notifiable = new User();

        $databasePayload = $notification->toDatabase($notifiable);

        $this->assertEquals('Out of Stock (Depleted)', $databasePayload['reason_label']);
        $this->assertStringContainsString('out of stock', strtolower($databasePayload['description']));
        $this->assertStringContainsString('highlighted_batch_id=99', $databasePayload['url']);
    }

    public function test_batch_archived_notification_with_staff_attribution(): void
    {
        $vaccine = new Vaccine();
        $vaccine->id = 3;
        $vaccine->name = 'Pentavalent';

        $batch = new VaccineInventory();
        $batch->id = 101;
        $batch->batch_number = 'PENTA-2026-M';
        $batch->quantity = 5;
        $batch->setRelation('vaccine', $vaccine);

        $notification = new BatchArchivedNotification(
            batch: $batch,
            reason: 'manual',
            reasonLabel: 'Manual Administrative Archive',
            isManual: true,
            staffName: 'Nurse Joy'
        );
        $notifiable = new User();

        $payload = $notification->toDatabase($notifiable);

        $this->assertEquals('Batch Archived: PENTA-2026-M', $payload['title']);
        $this->assertStringContainsString('Nurse Joy', $payload['description']);
        $this->assertStringContainsString('Manual Administrative Archive', $payload['description']);
        $this->assertEquals('info', $payload['priority']);
    }

    public function test_stock_adjusted_notification_payload_for_wastage(): void
    {
        $vaccine = new Vaccine();
        $vaccine->id = 4;
        $vaccine->name = 'OPV';

        $batch = new VaccineInventory();
        $batch->id = 55;
        $batch->batch_number = 'OPV-2026-004';
        $batch->quantity = 18;
        $batch->setRelation('vaccine', $vaccine);

        $notification = new \App\Notifications\StockAdjustedNotification(
            batch: $batch,
            type: 'wastage',
            quantityChange: -2,
            newQuantity: 18,
            staffName: 'Midwife Clara',
            remarks: 'Broken vial during preparation'
        );
        $notifiable = new User();

        $payload = $notification->toDatabase($notifiable);

        $this->assertEquals('inventory', $payload['type']);
        $this->assertEquals('Vaccine Wastage Logged: OPV-2026-004', $payload['title']);
        $this->assertEquals('warning', $payload['priority']);
        $this->assertStringContainsString('Midwife Clara', $payload['description']);
        $this->assertStringContainsString('deducted 2 dose(s)', $payload['description']);
        $this->assertStringContainsString('search=OPV-2026-004', $payload['url']);
        $this->assertEquals(-2, $payload['quantity_change']);
        $this->assertEquals(18, $payload['new_quantity']);
    }
}
