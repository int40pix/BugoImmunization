<?php

namespace Tests\Unit;

use App\Utils\DateHelper;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

class DateHelperTest extends TestCase
{
    public function test_it_calculates_age_in_months_correctly(): void
    {
        $sixMonthsAgo = Carbon::now()->subMonths(6);
        $months = DateHelper::getAgeInMonths($sixMonthsAgo);

        $this->assertEquals(6, $months);
    }

    public function test_it_formats_age_string_for_infants(): void
    {
        $threeMonthsAgo = Carbon::now()->subMonths(3);
        $formatted = DateHelper::formatAge($threeMonthsAgo);

        $this->assertStringContainsString('month', $formatted);
    }

    public function test_it_formats_age_string_for_toddlers(): void
    {
        $twoYearsAgo = Carbon::now()->subYears(2)->subMonths(3);
        $formatted = DateHelper::formatAge($twoYearsAgo);

        $this->assertStringContainsString('yr', $formatted);
    }
}
