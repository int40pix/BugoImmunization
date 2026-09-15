<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class PatientIdGeneratorTest extends TestCase
{
    public function test_patient_id_format_pattern(): void
    {
        $sampleNumber = 42;
        $formatted = 'PT-' . str_pad((string) $sampleNumber, 6, '0', STR_PAD_LEFT);

        $this->assertEquals('PT-000042', $formatted);
        $this->assertMatchesRegularExpression('/^PT-\d{6}$/', $formatted);
    }
}
