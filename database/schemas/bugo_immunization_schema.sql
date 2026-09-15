-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 11, 2026 at 06:37 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bugo_immunization`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guardians`
--

CREATE TABLE `guardians` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `guardian_no` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `remember_token` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `mother_maiden_name` varchar(255) DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `mother_information_unavailable` tinyint(1) NOT NULL DEFAULT 0,
  `father_information_unavailable` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guardians`
--

INSERT INTO `guardians` (`id`, `user_id`, `guardian_no`, `name`, `gender`, `email`, `password`, `remember_token`, `contact_number`, `mother_maiden_name`, `father_name`, `mother_information_unavailable`, `father_information_unavailable`, `status`, `email_verified_at`, `created_at`, `updated_at`) VALUES
(5, 19, 'GRD-2026-000001', 'Adriana Alvarez', 'Female', 'guardian@bugohealthcenter.local', NULL, NULL, '09938471211', 'Adriana Alvarez', 'Chris Hemsworth', 0, 0, 'active', NULL, '2026-09-10 08:08:16', '2026-09-10 08:08:16'),
(6, 20, 'GRD-2026-000006', 'Test Account', 'Male', NULL, NULL, NULL, '09928374121', 'Testicular Torsion', 'Test Account', 0, 0, 'active', NULL, '2026-09-10 08:23:59', '2026-09-10 08:23:59');

-- --------------------------------------------------------

--
-- Table structure for table `immunization_records`
--

CREATE TABLE `immunization_records` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `vaccine_id` bigint(20) UNSIGNED NOT NULL,
  `dose_number` tinyint(3) UNSIGNED NOT NULL,
  `date_administered` date NOT NULL,
  `administered_by` bigint(20) UNSIGNED DEFAULT NULL,
  `source` varchar(255) NOT NULL DEFAULT 'Health Center',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_07_16_145829_add_role_to_users_table', 1),
(5, '2026_07_19_132035_create_patients_table', 2),
(6, '2026_07_25_115426_add_status_to_users_table', 3),
(7, '2026_08_02_000001_enhance_patients_table', 4),
(8, '2026_08_02_000002_create_vaccines_table', 5),
(9, '2026_08_02_000003_create_vaccine_schedules_table', 5),
(10, '2026_08_02_000004_create_patient_immunizations_table', 5),
(11, '2026_08_02_000005_drop_immunization_tables', 6),
(15, '2026_08_04_060337_create_vaccine_inventories_table', 7),
(16, '2026_08_11_104314_create_immunization_records_table', 8),
(17, '2026_08_11_132420_create_vaccines_table', 9),
(18, '2026_08_11_140143_replace_vaccine_type_with_vaccine_id_in_immunization_records_table', 10),
(19, '2026_08_15_132023_change_vaccine_type_to_vaccine_id_in_immunization_records_table', 11),
(20, '2026_08_15_135810_create_immunization_records_table', 12),
(21, '2026_08_16_085447_add_required_doses_to_vaccines_table', 13),
(22, '2026_08_18_113237_create_vaccine_schedules_table', 14),
(23, '2026_08_21_120441_add_category_to_vaccines_table', 15),
(24, '2026_08_21_121919_change_interval_to_integer_in_vaccine_schedules_table', 16),
(25, '2026_08_21_130555_add_vaccine_id_to_vaccine_inventories_table', 17),
(26, '2026_08_21_141801_drop_vaccine_type_from_vaccine_inventories_table', 18),
(27, '2026_08_23_095728_add_archive_fields_to_vaccine_inventories_table', 19),
(28, '2026_08_23_120117_create_patient_vaccine_schedules_table', 20),
(29, '2026_08_28_161411_create_patient_vaccines_table', 20),
(30, '2026_08_30_094658_create_patient_immunization_card_rows_table', 21),
(31, '2026_08_30_123912_add_batch_allocation_to_patient_vaccine_schedules_table', 22),
(32, '2026_08_30_133053_change_patient_vaccine_schedule_batch_fk_to_null_on_delete', 23),
(33, '2026_08_31_133040_create_notifications_table', 24),
(34, '2026_09_08_081934_create_guardians_table', 25),
(35, '2026_09_08_082139_update_patients_for_guardian_architecture', 25),
(36, '2026_09_08_101909_add_parent_information_to_guardians_table', 26),
(37, '2026_09_10_121415_create_roles_table', 27),
(38, '2026_09_10_121927_add_unified_account_fields_to_users_table', 27),
(39, '2026_09_10_121953_add_user_id_to_guardians_table', 27),
(40, '2026_09_10_132024_make_guardian_legacy_auth_fields_nullable', 28),
(41, '2026_09_10_132517_add_gender_to_guardians_table', 29),
(42, '2026_09_10_144433_connect_account_hierarchy_with_cascades', 30),
(43, '2026_09_10_150815_create_password_reset_requests_table', 31);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_requests`
--

CREATE TABLE `password_reset_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_requests`
--

INSERT INTO `password_reset_requests` (`id`, `user_id`, `status`, `requested_at`, `resolved_by`, `resolved_at`, `created_at`, `updated_at`) VALUES
(1, 19, 'pending', '2026-09-10 08:10:58', NULL, NULL, '2026-09-10 08:10:58', '2026-09-10 08:10:58');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `guardian_id` bigint(20) UNSIGNED DEFAULT NULL,
  `patient_id` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) NOT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `birth_type` varchar(255) DEFAULT NULL,
  `is_full_term` tinyint(1) DEFAULT NULL,
  `multiple_birth` varchar(255) DEFAULT NULL,
  `birth_attendant` varchar(255) DEFAULT NULL,
  `blood_type` varchar(10) DEFAULT NULL,
  `birth_weight` decimal(5,2) DEFAULT NULL,
  `birth_length` decimal(5,2) DEFAULT NULL,
  `head_circumference` decimal(5,2) DEFAULT NULL,
  `chest_circumference` decimal(5,2) DEFAULT NULL,
  `birth_order` tinyint(3) UNSIGNED DEFAULT NULL,
  `birth_registration_date` date DEFAULT NULL,
  `birth_registration_place` varchar(255) DEFAULT NULL,
  `birth_family_notes` text DEFAULT NULL,
  `sex` enum('Male','Female') NOT NULL,
  `address` text NOT NULL,
  `guardian_relationship` varchar(255) DEFAULT NULL,
  `allergies` varchar(255) DEFAULT NULL,
  `existing_conditions` varchar(255) DEFAULT NULL,
  `medical_background` text DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `guardian_id`, `patient_id`, `first_name`, `middle_name`, `last_name`, `nickname`, `mother_name`, `father_name`, `date_of_birth`, `birth_type`, `is_full_term`, `multiple_birth`, `birth_attendant`, `blood_type`, `birth_weight`, `birth_length`, `head_circumference`, `chest_circumference`, `birth_order`, `birth_registration_date`, `birth_registration_place`, `birth_family_notes`, `sex`, `address`, `guardian_relationship`, `allergies`, `existing_conditions`, `medical_background`, `status`, `created_at`, `updated_at`) VALUES
(14, 5, 'PT-000001', 'Christina', 'Alvarez', 'Hemsworth', 'Cristi', NULL, NULL, '2026-09-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Female', 'Zone 4, Balite', 'Mother', NULL, NULL, NULL, 'Active', '2026-09-10 08:08:16', '2026-09-10 08:08:16'),
(15, 6, 'PT-000002', 'Tessie', 'Account', 'Torsion', 'Testes', NULL, NULL, '2026-09-01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Male', 'super test idol', 'Father', NULL, NULL, NULL, 'Active', '2026-09-10 08:23:59', '2026-09-10 08:23:59');

-- --------------------------------------------------------

--
-- Table structure for table `patient_immunization_card_rows`
--

CREATE TABLE `patient_immunization_card_rows` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `vaccine_name` varchar(255) NOT NULL,
  `dose_count` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `doses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`doses`)),
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patient_vaccines`
--

CREATE TABLE `patient_vaccines` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `vaccine_id` bigint(20) UNSIGNED NOT NULL,
  `added_by` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `patient_vaccine_schedules`
--

CREATE TABLE `patient_vaccine_schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `patient_id` bigint(20) UNSIGNED NOT NULL,
  `vaccine_id` bigint(20) UNSIGNED NOT NULL,
  `vaccine_inventory_id` bigint(20) UNSIGNED DEFAULT NULL,
  `dose_number` tinyint(3) UNSIGNED NOT NULL,
  `scheduled_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'scheduled',
  `is_manually_adjusted` tinyint(1) NOT NULL DEFAULT 0,
  `is_series_completion_candidate` tinyint(1) NOT NULL DEFAULT 0,
  `priority_reason` varchar(255) DEFAULT NULL,
  `allocation_rank` int(10) UNSIGNED DEFAULT NULL,
  `allocation_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allocation_snapshot`)),
  `allocated_at` timestamp NULL DEFAULT NULL,
  `adjusted_by` bigint(20) UNSIGNED DEFAULT NULL,
  `adjusted_at` timestamp NULL DEFAULT NULL,
  `adjustment_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `patient_vaccine_schedules`
--

INSERT INTO `patient_vaccine_schedules` (`id`, `patient_id`, `vaccine_id`, `vaccine_inventory_id`, `dose_number`, `scheduled_date`, `status`, `is_manually_adjusted`, `is_series_completion_candidate`, `priority_reason`, `allocation_rank`, `allocation_snapshot`, `allocated_at`, `adjusted_by`, `adjusted_at`, `adjustment_reason`, `created_at`, `updated_at`) VALUES
(39, 14, 1, 19, 1, '2026-09-16', 'scheduled', 0, 0, 'Current Age', 1, '{\"priority_reason\":\"Current Age\",\"is_series_completion_candidate\":false,\"schedule_label\":\"Current Age\",\"recommended_date\":\"2026-09-01\",\"eligible_date\":\"2026-09-01\",\"completed_doses\":0,\"required_doses\":1,\"doses_remaining\":1,\"allocation_rank\":1,\"tie_break_order\":[\"series_completion\",\"schedule_label\",\"eligible_date\",\"patient_name\"],\"patient_name\":\"Christina Alvarez Hemsworth\",\"original_batch\":{\"id\":19,\"batch_number\":\"BCG-2026-001\",\"expiration_date\":\"2027-09-08\"}}', '2026-09-10 08:08:16', NULL, NULL, NULL, '2026-09-10 08:08:16', '2026-09-10 08:08:16'),
(40, 14, 2, 21, 1, '2026-09-16', 'scheduled', 0, 0, 'Current Age', 1, '{\"priority_reason\":\"Current Age\",\"is_series_completion_candidate\":false,\"schedule_label\":\"Current Age\",\"recommended_date\":\"2026-09-01\",\"eligible_date\":\"2026-09-01\",\"completed_doses\":0,\"required_doses\":1,\"doses_remaining\":1,\"allocation_rank\":1,\"tie_break_order\":[\"series_completion\",\"schedule_label\",\"eligible_date\",\"patient_name\"],\"patient_name\":\"Christina Alvarez Hemsworth\",\"original_batch\":{\"id\":21,\"batch_number\":\"HPV-2026-000\",\"expiration_date\":\"2027-01-08\"}}', '2026-09-10 08:08:16', NULL, NULL, NULL, '2026-09-10 08:08:16', '2026-09-10 08:08:16'),
(41, 15, 1, 19, 1, '2026-09-16', 'scheduled', 0, 0, 'Current Age', 1, '{\"priority_reason\":\"Current Age\",\"is_series_completion_candidate\":false,\"schedule_label\":\"Current Age\",\"recommended_date\":\"2026-09-01\",\"eligible_date\":\"2026-09-01\",\"completed_doses\":0,\"required_doses\":1,\"doses_remaining\":1,\"allocation_rank\":1,\"tie_break_order\":[\"series_completion\",\"schedule_label\",\"eligible_date\",\"patient_name\"],\"patient_name\":\"Tessie Account Torsion\",\"original_batch\":{\"id\":19,\"batch_number\":\"BCG-2026-001\",\"expiration_date\":\"2027-09-08\"}}', '2026-09-10 08:23:59', NULL, NULL, NULL, '2026-09-10 08:23:59', '2026-09-10 08:23:59'),
(42, 15, 2, 21, 1, '2026-09-16', 'scheduled', 0, 0, 'Current Age', 1, '{\"priority_reason\":\"Current Age\",\"is_series_completion_candidate\":false,\"schedule_label\":\"Current Age\",\"recommended_date\":\"2026-09-01\",\"eligible_date\":\"2026-09-01\",\"completed_doses\":0,\"required_doses\":1,\"doses_remaining\":1,\"allocation_rank\":1,\"tie_break_order\":[\"series_completion\",\"schedule_label\",\"eligible_date\",\"patient_name\"],\"patient_name\":\"Tessie Account Torsion\",\"original_batch\":{\"id\":21,\"batch_number\":\"HPV-2026-000\",\"expiration_date\":\"2027-01-08\"}}', '2026-09-10 08:23:59', NULL, NULL, NULL, '2026-09-10 08:23:59', '2026-09-10 08:23:59');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `display_name`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'Administrator', '2026-09-10 04:25:01', '2026-09-10 04:25:01'),
(2, 'nurse', 'Nurse', '2026-09-10 04:25:01', '2026-09-10 04:25:01'),
(3, 'midwife', 'Midwife', '2026-09-10 04:25:01', '2026-09-10 04:25:01'),
(4, 'bhw', 'Barangay Health Worker', '2026-09-10 04:25:01', '2026-09-10 04:25:01'),
(5, 'guardian', 'Parent / Guardian', '2026-09-10 04:25:01', '2026-09-10 04:25:01');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('19zD1q86pjy8zxrnek2D7TBzZvb8dNyLFcEmjHbo', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiMjdON0FXT056TUJaSnJidUFqRFk5RjZPekdWb1ZhQmhtR3BWOHBVZSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1789055587),
('6A338WE1r8LUsCUiSq60Rlf0pFuW6hEb9AcFEIaW', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoialVOZEpnTlREMzZxSHRVNVZrN0EwN09tbHZIOGpDdHo1NTNnekVGTyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1789054746),
('a10fpNYgr3caMkc4Rh8KKah2G6M9B3MIeqEsek9D', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiUXV1bEI2Q0tRcFk1UGFJMGV6VlZxWUZBbVFoMUp5RjZuYU4wam5oRyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1789057481),
('iVJutw5XUmbJntM9uR7dnVA1M3pP5isHgWLb3YbS', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiTE9KRDk4TmFYTWxFUDNVNzhEY3o3Z2YweUNabXRyNXhJcDJkUGJMdCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1789052704),
('jizNUx1TXCOKkvkLQFAjL0NS8Rh00FpUs3app5li', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNGEyQ1kyYmZHWk9GN2RKa28ydVJzNU81bUg5eEJYZjB3Y0xvOEJkWSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7czo0OiJob21lIjt9fQ==', 1789058201),
('juk41CcBUGeLs32RZHw2R433lbso2LNZtRz4tYae', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiTWNTZkIzSXI4OERaZFY2Wk5abVR6RWtrOXFOV0lDZWJGcU9IeGwwUCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1789057294),
('K0fwzIuvZhPa40tIyJ1UnEQVwUR4p0LqVa7nzCYx', 20, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoibVp1WXdRQ2FaRU5SMW4xU2d4Y2ppb2dSdkd2QkM1TEd5T0UwZndOaCI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozMDoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3BhdGllbnRzIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MjA7fQ==', 1789057494),
('PFNZSDtfn6frEzjMqxgSOi8qBY3LGDIUEZLCYjkI', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiYkswSjFmR29IT2lsYWhDTnpYbng1ZHlRWnRtTVNTTVN5Zk9ra1FEeSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1789054784),
('r8kUPNgfd1Xbc6f9DlHcqr7jpqjKIhHYM0EvztYs', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiWWl5SEtXck5jbEw2aHR2cVdwekN0WlN3Y25pMHB1Q013WjRFMzNuQSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1789056721),
('sFZEAJjziEwIPml1RdojBHL5c9ZSUdUEwd1favLf', 19, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoieE94ZTFSR1l3djNmUmV1RGNJUkVwS0FvbmhadFplQTR6MllvT3lpdyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozNDoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2ltbXVuaXphdGlvbiI7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE5O30=', 1789057231),
('xo7ASjoMAq1ltPW7nrCRwLVbqi5bKG1EPQ5p9LQc', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiaUdydmR2ZVpWSVZ3NlZrSVVHemtuTTk1cGpSSlc5UUhnYVVYQ3FETSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1789056625);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` enum('admin','nurse','midwife','bhw','patient') NOT NULL DEFAULT 'patient',
  `role_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `account_status` varchar(255) NOT NULL DEFAULT 'active',
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `role`, `role_id`, `status`, `account_status`, `must_change_password`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Brandolph Alerta', 'admin@bugohealthcenter.local', 'admin', 1, 'active', 'active', 0, NULL, '$2y$12$qA0fJb90E69jggKgcSacwOxANUt1Nme2xgKy9Nu8w74quEOBkOfHS', 'DP8ayRX0gyTXcLPVDi8CfXpz0SI64k8xm7a68q7tLLWqDixIrINCttr4gbYk', '2026-07-16 22:36:39', '2026-08-12 22:40:54'),
(4, 'Arron Gabriel T. Sumilla', 'bhw@bugohealthcenter.local', 'bhw', 4, 'active', 'active', 0, NULL, '$2y$12$gbfKgbeIJamaiez0q3h/DeJC62/9/l3VV8oAyIH6QJ/aULyTWzH5y', NULL, '2026-07-25 05:22:59', '2026-07-25 05:59:22'),
(5, 'Justine V. Buico', 'nurse@bugohealthcenter.local', 'nurse', 2, 'active', 'active', 0, NULL, '$2y$12$IOC/hjDAc4rVccSoefIV3efAT56xDML6z8.8JZZJv0yO7az4J/q9a', NULL, '2026-07-25 05:24:55', '2026-07-25 05:24:55'),
(6, 'Johnbert S. Urgello', 'midwife@bugohealthcenter.local', 'midwife', 3, 'active', 'active', 0, NULL, '$2y$12$DvIlxc530Dqq7a4xWJT/He1I.Q/dQDTUBjWDn4uyQMF1vSnzmtVY2', NULL, '2026-07-25 05:26:11', '2026-08-30 22:39:32'),
(19, 'Adriana Alvarez', 'guardian@bugohealthcenter.local', 'patient', 5, 'active', 'active', 0, NULL, '$2y$12$t.ddDWYxCbBGBaBxhCnaIeUhy81SYMZ/c9MrQvXTdqoJaRIfGrsfC', NULL, '2026-09-10 08:08:16', '2026-09-10 08:20:46'),
(20, 'Test Account', 'testguardian@bugohealthcenter.local', 'patient', 5, 'active', 'active', 0, NULL, '$2y$12$ordjNax5MhVHHZf/WvdSpuUGQPnTGsXlvtawPy57IC37TZhbneU4.', NULL, '2026-09-10 08:23:59', '2026-09-10 08:25:11');

-- --------------------------------------------------------

--
-- Table structure for table `vaccines`
--

CREATE TABLE `vaccines` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `required_doses` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `category` varchar(255) NOT NULL DEFAULT 'routine',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vaccines`
--

INSERT INTO `vaccines` (`id`, `name`, `description`, `required_doses`, `category`, `created_at`, `updated_at`) VALUES
(1, 'BCG', 'Bacillus Calmette-Guérin vaccine.', 1, 'routine', '2026-08-11 05:38:31', '2026-08-11 05:38:31'),
(2, 'Hepatitis B', 'Hepatitis B vaccine.', 1, 'routine', '2026-08-11 05:38:31', '2026-08-11 05:38:31'),
(3, 'Pentavalent', 'DPT-Hep B-Hib vaccine.', 3, 'routine', '2026-08-11 05:38:31', '2026-08-11 05:38:31'),
(4, 'OPV', 'Oral Polio Vaccine.', 3, 'routine', '2026-08-11 05:38:31', '2026-08-11 05:38:31'),
(5, 'IPV', 'Inactivated Polio Vaccine.', 2, 'routine', '2026-08-11 05:38:31', '2026-08-11 05:38:31'),
(6, 'PCV', 'Pneumococcal Conjugate Vaccine.', 3, 'routine', '2026-08-11 05:38:31', '2026-08-11 05:38:31'),
(7, 'MMR', 'Measles, Mumps, and Rubella vaccine.', 2, 'routine', '2026-08-11 05:38:31', '2026-08-11 05:38:31');

-- --------------------------------------------------------

--
-- Table structure for table `vaccine_inventories`
--

CREATE TABLE `vaccine_inventories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `vaccine_id` bigint(20) UNSIGNED DEFAULT NULL,
  `batch_number` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `date_received` date NOT NULL,
  `expiration_date` date NOT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `supplier` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `is_archived` tinyint(1) NOT NULL DEFAULT 0,
  `archived_at` timestamp NULL DEFAULT NULL,
  `archive_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vaccine_inventories`
--

INSERT INTO `vaccine_inventories` (`id`, `vaccine_id`, `batch_number`, `quantity`, `date_received`, `expiration_date`, `manufacturer`, `supplier`, `remarks`, `is_archived`, `archived_at`, `archive_reason`, `created_at`, `updated_at`) VALUES
(19, 1, 'BCG-2026-001', 45, '2026-09-01', '2027-09-08', NULL, NULL, NULL, 0, NULL, NULL, '2026-09-08 06:26:38', '2026-09-08 06:26:38'),
(20, 2, 'HPB-2026-001', 30, '2026-09-01', '2027-09-09', NULL, NULL, NULL, 0, NULL, NULL, '2026-09-08 06:27:23', '2026-09-08 06:27:23'),
(21, 2, 'HPV-2026-000', 13, '2026-01-01', '2027-01-08', NULL, NULL, NULL, 0, NULL, NULL, '2026-09-08 06:28:19', '2026-09-08 07:00:08'),
(22, 3, 'PTV-2026-001', 30, '2026-09-08', '2027-05-15', NULL, NULL, NULL, 0, NULL, NULL, '2026-09-08 06:42:40', '2026-09-08 06:42:40'),
(23, 1, 'BCG-2026-002', 30, '2026-09-09', '2027-10-12', NULL, NULL, NULL, 0, NULL, NULL, '2026-09-08 08:13:25', '2026-09-08 08:13:25');

-- --------------------------------------------------------

--
-- Table structure for table `vaccine_schedules`
--

CREATE TABLE `vaccine_schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `vaccine_id` bigint(20) UNSIGNED NOT NULL,
  `dose_number` tinyint(3) UNSIGNED NOT NULL,
  `recommended_age` varchar(255) NOT NULL,
  `interval` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vaccine_schedules`
--

INSERT INTO `vaccine_schedules` (`id`, `vaccine_id`, `dose_number`, `recommended_age`, `interval`, `created_at`, `updated_at`) VALUES
(8, 2, 1, '0 days', NULL, '2026-08-21 07:10:27', '2026-08-21 07:10:27'),
(12, 4, 1, '1.5 months', NULL, '2026-08-21 07:10:27', '2026-08-21 07:10:27'),
(13, 4, 2, '2.5 months', 30, '2026-08-21 07:10:27', '2026-08-21 07:10:27'),
(14, 4, 3, '3.5 months', 30, '2026-08-21 07:10:27', '2026-08-21 07:10:27'),
(15, 5, 1, '3.5 months', NULL, '2026-08-21 07:10:27', '2026-08-21 07:10:27'),
(16, 5, 2, '9 months', 165, '2026-08-21 07:10:27', '2026-08-21 07:10:27'),
(17, 6, 1, '1.5 months', NULL, '2026-08-21 07:10:27', '2026-08-21 07:10:27'),
(18, 6, 2, '2.5 months', 30, '2026-08-21 07:10:27', '2026-08-21 07:10:27'),
(19, 6, 3, '3.5 months', 30, '2026-08-21 07:10:27', '2026-08-21 07:10:27'),
(20, 7, 1, '9 months', NULL, '2026-08-21 07:10:27', '2026-08-21 07:10:27'),
(21, 7, 2, '1 year', 95, '2026-08-21 07:10:27', '2026-08-21 07:10:27'),
(22, 1, 1, '0 days', NULL, '2026-08-26 20:30:21', '2026-08-26 20:30:21'),
(23, 3, 1, '1.5 months', NULL, '2026-08-26 20:30:55', '2026-08-26 20:30:55'),
(24, 3, 2, '2.5 months', 30, '2026-08-26 20:30:55', '2026-08-26 20:30:55'),
(25, 3, 3, '3.5 months', 30, '2026-08-26 20:30:55', '2026-08-26 20:30:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `guardians`
--
ALTER TABLE `guardians`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `guardians_guardian_no_unique` (`guardian_no`),
  ADD UNIQUE KEY `guardians_email_unique` (`email`),
  ADD UNIQUE KEY `guardians_user_id_unique` (`user_id`);

--
-- Indexes for table `immunization_records`
--
ALTER TABLE `immunization_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `immunization_records_patient_id_foreign` (`patient_id`),
  ADD KEY `immunization_records_vaccine_id_foreign` (`vaccine_id`),
  ADD KEY `immunization_records_administered_by_foreign` (`administered_by`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `password_reset_requests`
--
ALTER TABLE `password_reset_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `password_reset_requests_resolved_by_foreign` (`resolved_by`),
  ADD KEY `password_reset_requests_status_requested_at_index` (`status`,`requested_at`),
  ADD KEY `password_reset_requests_user_id_status_index` (`user_id`,`status`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patients_patient_id_unique` (`patient_id`),
  ADD KEY `patients_guardian_id_fk` (`guardian_id`);

--
-- Indexes for table `patient_immunization_card_rows`
--
ALTER TABLE `patient_immunization_card_rows`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_immunization_card_rows_patient_id_index` (`patient_id`);

--
-- Indexes for table `patient_vaccines`
--
ALTER TABLE `patient_vaccines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `patient_vaccines_patient_id_vaccine_id_unique` (`patient_id`,`vaccine_id`),
  ADD KEY `patient_vaccines_vaccine_id_foreign` (`vaccine_id`),
  ADD KEY `patient_vaccines_added_by_foreign` (`added_by`);

--
-- Indexes for table `patient_vaccine_schedules`
--
ALTER TABLE `patient_vaccine_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pvs_patient_vaccine_dose_unique` (`patient_id`,`vaccine_id`,`dose_number`),
  ADD KEY `patient_vaccine_schedules_vaccine_id_foreign` (`vaccine_id`),
  ADD KEY `patient_vaccine_schedules_adjusted_by_foreign` (`adjusted_by`),
  ADD KEY `pvs_date_status_index` (`scheduled_date`,`status`),
  ADD KEY `patient_vaccine_schedules_vaccine_inventory_id_foreign` (`vaccine_inventory_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_role_id_fk` (`role_id`);

--
-- Indexes for table `vaccines`
--
ALTER TABLE `vaccines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vaccines_name_unique` (`name`);

--
-- Indexes for table `vaccine_inventories`
--
ALTER TABLE `vaccine_inventories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vaccine_inventories_batch_number_unique` (`batch_number`),
  ADD KEY `vaccine_inventories_vaccine_id_foreign` (`vaccine_id`);

--
-- Indexes for table `vaccine_schedules`
--
ALTER TABLE `vaccine_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vaccine_schedules_vaccine_id_dose_number_unique` (`vaccine_id`,`dose_number`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guardians`
--
ALTER TABLE `guardians`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `immunization_records`
--
ALTER TABLE `immunization_records`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `password_reset_requests`
--
ALTER TABLE `password_reset_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `patient_immunization_card_rows`
--
ALTER TABLE `patient_immunization_card_rows`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `patient_vaccines`
--
ALTER TABLE `patient_vaccines`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `patient_vaccine_schedules`
--
ALTER TABLE `patient_vaccine_schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `vaccines`
--
ALTER TABLE `vaccines`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `vaccine_inventories`
--
ALTER TABLE `vaccine_inventories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `vaccine_schedules`
--
ALTER TABLE `vaccine_schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `guardians`
--
ALTER TABLE `guardians`
  ADD CONSTRAINT `guardians_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `immunization_records`
--
ALTER TABLE `immunization_records`
  ADD CONSTRAINT `immunization_records_administered_by_foreign` FOREIGN KEY (`administered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `immunization_records_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `immunization_records_vaccine_id_foreign` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `password_reset_requests`
--
ALTER TABLE `password_reset_requests`
  ADD CONSTRAINT `password_reset_requests_resolved_by_foreign` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `password_reset_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `patients`
--
ALTER TABLE `patients`
  ADD CONSTRAINT `patients_guardian_id_fk` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `patient_immunization_card_rows`
--
ALTER TABLE `patient_immunization_card_rows`
  ADD CONSTRAINT `patient_immunization_card_rows_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `patient_vaccines`
--
ALTER TABLE `patient_vaccines`
  ADD CONSTRAINT `patient_vaccines_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `patient_vaccines_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_vaccines_vaccine_id_foreign` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines` (`id`);

--
-- Constraints for table `patient_vaccine_schedules`
--
ALTER TABLE `patient_vaccine_schedules`
  ADD CONSTRAINT `patient_vaccine_schedules_adjusted_by_foreign` FOREIGN KEY (`adjusted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `patient_vaccine_schedules_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `patient_vaccine_schedules_vaccine_id_foreign` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines` (`id`),
  ADD CONSTRAINT `patient_vaccine_schedules_vaccine_inventory_id_foreign` FOREIGN KEY (`vaccine_inventory_id`) REFERENCES `vaccine_inventories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `vaccine_inventories`
--
ALTER TABLE `vaccine_inventories`
  ADD CONSTRAINT `vaccine_inventories_vaccine_id_foreign` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines` (`id`);

--
-- Constraints for table `vaccine_schedules`
--
ALTER TABLE `vaccine_schedules`
  ADD CONSTRAINT `vaccine_schedules_vaccine_id_foreign` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
