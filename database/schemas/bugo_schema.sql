-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: bugo
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guardians`
--

DROP TABLE IF EXISTS `guardians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `guardians` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
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
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guardians_guardian_no_unique` (`guardian_no`),
  UNIQUE KEY `guardians_email_unique` (`email`),
  UNIQUE KEY `guardians_user_id_unique` (`user_id`),
  CONSTRAINT `guardians_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guardians`
--

LOCK TABLES `guardians` WRITE;
/*!40000 ALTER TABLE `guardians` DISABLE KEYS */;
INSERT INTO `guardians` VALUES (5,19,'GRD-2026-000001','Adriana Alvarez','Female','guardian@bugohealthcenter.local',NULL,NULL,'09938471211','Adriana Alvarez','Chris Hemsworth',0,0,'active',NULL,'2026-09-10 08:08:16','2026-09-10 08:08:16'),(6,20,'GRD-2026-000006','Test Account','Male',NULL,NULL,NULL,'09928374121','Testicular Torsion','Test Account',0,0,'active',NULL,'2026-09-10 08:23:59','2026-09-10 08:23:59');
/*!40000 ALTER TABLE `guardians` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `immunization_records`
--

DROP TABLE IF EXISTS `immunization_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `immunization_records` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) unsigned NOT NULL,
  `vaccine_id` bigint(20) unsigned NOT NULL,
  `dose_number` tinyint(3) unsigned NOT NULL,
  `date_administered` date NOT NULL,
  `administered_by` bigint(20) unsigned DEFAULT NULL,
  `source` varchar(255) NOT NULL DEFAULT 'Health Center',
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `immunization_records_patient_id_foreign` (`patient_id`),
  KEY `immunization_records_vaccine_id_foreign` (`vaccine_id`),
  KEY `immunization_records_administered_by_foreign` (`administered_by`),
  CONSTRAINT `immunization_records_administered_by_foreign` FOREIGN KEY (`administered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `immunization_records_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `immunization_records_vaccine_id_foreign` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `immunization_records`
--

LOCK TABLES `immunization_records` WRITE;
/*!40000 ALTER TABLE `immunization_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `immunization_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_07_16_145829_add_role_to_users_table',1),(5,'2026_07_19_132035_create_patients_table',2),(6,'2026_07_25_115426_add_status_to_users_table',3),(7,'2026_08_02_000001_enhance_patients_table',4),(8,'2026_08_02_000002_create_vaccines_table',5),(9,'2026_08_02_000003_create_vaccine_schedules_table',5),(10,'2026_08_02_000004_create_patient_immunizations_table',5),(11,'2026_08_02_000005_drop_immunization_tables',6),(15,'2026_08_04_060337_create_vaccine_inventories_table',7),(16,'2026_08_11_104314_create_immunization_records_table',8),(17,'2026_08_11_132420_create_vaccines_table',9),(18,'2026_08_11_140143_replace_vaccine_type_with_vaccine_id_in_immunization_records_table',10),(19,'2026_08_15_132023_change_vaccine_type_to_vaccine_id_in_immunization_records_table',11),(20,'2026_08_15_135810_create_immunization_records_table',12),(21,'2026_08_16_085447_add_required_doses_to_vaccines_table',13),(22,'2026_08_18_113237_create_vaccine_schedules_table',14),(23,'2026_08_21_120441_add_category_to_vaccines_table',15),(24,'2026_08_21_121919_change_interval_to_integer_in_vaccine_schedules_table',16),(25,'2026_08_21_130555_add_vaccine_id_to_vaccine_inventories_table',17),(26,'2026_08_21_141801_drop_vaccine_type_from_vaccine_inventories_table',18),(27,'2026_08_23_095728_add_archive_fields_to_vaccine_inventories_table',19),(28,'2026_08_23_120117_create_patient_vaccine_schedules_table',20),(29,'2026_08_28_161411_create_patient_vaccines_table',20),(30,'2026_08_30_094658_create_patient_immunization_card_rows_table',21),(31,'2026_08_30_123912_add_batch_allocation_to_patient_vaccine_schedules_table',22),(32,'2026_08_30_133053_change_patient_vaccine_schedule_batch_fk_to_null_on_delete',23),(33,'2026_08_31_133040_create_notifications_table',24),(34,'2026_09_08_081934_create_guardians_table',25),(35,'2026_09_08_082139_update_patients_for_guardian_architecture',25),(36,'2026_09_08_101909_add_parent_information_to_guardians_table',26),(37,'2026_09_10_121415_create_roles_table',27),(38,'2026_09_10_121927_add_unified_account_fields_to_users_table',27),(39,'2026_09_10_121953_add_user_id_to_guardians_table',27),(40,'2026_09_10_132024_make_guardian_legacy_auth_fields_nullable',28),(41,'2026_09_10_132517_add_gender_to_guardians_table',29),(42,'2026_09_10_144433_connect_account_hierarchy_with_cascades',30),(43,'2026_09_10_150815_create_password_reset_requests_table',31);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) unsigned NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_requests`
--

DROP TABLE IF EXISTS `password_reset_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_requests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolved_by` bigint(20) unsigned DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `password_reset_requests_resolved_by_foreign` (`resolved_by`),
  KEY `password_reset_requests_status_requested_at_index` (`status`,`requested_at`),
  KEY `password_reset_requests_user_id_status_index` (`user_id`,`status`),
  CONSTRAINT `password_reset_requests_resolved_by_foreign` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `password_reset_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_requests`
--

LOCK TABLES `password_reset_requests` WRITE;
/*!40000 ALTER TABLE `password_reset_requests` DISABLE KEYS */;
INSERT INTO `password_reset_requests` VALUES (1,19,'pending','2026-09-10 08:10:58',NULL,NULL,'2026-09-10 08:10:58','2026-09-10 08:10:58');
/*!40000 ALTER TABLE `password_reset_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_immunization_card_rows`
--

DROP TABLE IF EXISTS `patient_immunization_card_rows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient_immunization_card_rows` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) unsigned NOT NULL,
  `vaccine_name` varchar(255) NOT NULL,
  `dose_count` int(10) unsigned NOT NULL DEFAULT 1,
  `doses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`doses`)),
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_immunization_card_rows_patient_id_index` (`patient_id`),
  CONSTRAINT `patient_immunization_card_rows_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_immunization_card_rows`
--

LOCK TABLES `patient_immunization_card_rows` WRITE;
/*!40000 ALTER TABLE `patient_immunization_card_rows` DISABLE KEYS */;
/*!40000 ALTER TABLE `patient_immunization_card_rows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_vaccine_schedules`
--

DROP TABLE IF EXISTS `patient_vaccine_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient_vaccine_schedules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) unsigned NOT NULL,
  `vaccine_id` bigint(20) unsigned NOT NULL,
  `vaccine_inventory_id` bigint(20) unsigned DEFAULT NULL,
  `dose_number` tinyint(3) unsigned NOT NULL,
  `scheduled_date` date DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'scheduled',
  `is_manually_adjusted` tinyint(1) NOT NULL DEFAULT 0,
  `is_series_completion_candidate` tinyint(1) NOT NULL DEFAULT 0,
  `priority_reason` varchar(255) DEFAULT NULL,
  `allocation_rank` int(10) unsigned DEFAULT NULL,
  `allocation_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allocation_snapshot`)),
  `allocated_at` timestamp NULL DEFAULT NULL,
  `adjusted_by` bigint(20) unsigned DEFAULT NULL,
  `adjusted_at` timestamp NULL DEFAULT NULL,
  `adjustment_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pvs_patient_vaccine_dose_unique` (`patient_id`,`vaccine_id`,`dose_number`),
  KEY `patient_vaccine_schedules_vaccine_id_foreign` (`vaccine_id`),
  KEY `patient_vaccine_schedules_adjusted_by_foreign` (`adjusted_by`),
  KEY `pvs_date_status_index` (`scheduled_date`,`status`),
  KEY `patient_vaccine_schedules_vaccine_inventory_id_foreign` (`vaccine_inventory_id`),
  CONSTRAINT `patient_vaccine_schedules_adjusted_by_foreign` FOREIGN KEY (`adjusted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `patient_vaccine_schedules_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `patient_vaccine_schedules_vaccine_id_foreign` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines` (`id`),
  CONSTRAINT `patient_vaccine_schedules_vaccine_inventory_id_foreign` FOREIGN KEY (`vaccine_inventory_id`) REFERENCES `vaccine_inventories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_vaccine_schedules`
--

LOCK TABLES `patient_vaccine_schedules` WRITE;
/*!40000 ALTER TABLE `patient_vaccine_schedules` DISABLE KEYS */;
INSERT INTO `patient_vaccine_schedules` VALUES (39,14,1,19,1,'2026-09-16','scheduled',0,0,'Current Age',1,'{\"priority_reason\":\"Current Age\",\"is_series_completion_candidate\":false,\"schedule_label\":\"Current Age\",\"recommended_date\":\"2026-09-01\",\"eligible_date\":\"2026-09-01\",\"completed_doses\":0,\"required_doses\":1,\"doses_remaining\":1,\"allocation_rank\":1,\"tie_break_order\":[\"series_completion\",\"schedule_label\",\"eligible_date\",\"patient_name\"],\"patient_name\":\"Christina Alvarez Hemsworth\",\"original_batch\":{\"id\":19,\"batch_number\":\"BCG-2026-001\",\"expiration_date\":\"2027-09-08\"}}','2026-09-10 08:08:16',NULL,NULL,NULL,'2026-09-10 08:08:16','2026-09-10 08:08:16'),(40,14,2,21,1,'2026-09-16','scheduled',0,0,'Current Age',1,'{\"priority_reason\":\"Current Age\",\"is_series_completion_candidate\":false,\"schedule_label\":\"Current Age\",\"recommended_date\":\"2026-09-01\",\"eligible_date\":\"2026-09-01\",\"completed_doses\":0,\"required_doses\":1,\"doses_remaining\":1,\"allocation_rank\":1,\"tie_break_order\":[\"series_completion\",\"schedule_label\",\"eligible_date\",\"patient_name\"],\"patient_name\":\"Christina Alvarez Hemsworth\",\"original_batch\":{\"id\":21,\"batch_number\":\"HPV-2026-000\",\"expiration_date\":\"2027-01-08\"}}','2026-09-10 08:08:16',NULL,NULL,NULL,'2026-09-10 08:08:16','2026-09-10 08:08:16'),(41,15,1,19,1,'2026-09-16','scheduled',0,0,'Current Age',1,'{\"priority_reason\":\"Current Age\",\"is_series_completion_candidate\":false,\"schedule_label\":\"Current Age\",\"recommended_date\":\"2026-09-01\",\"eligible_date\":\"2026-09-01\",\"completed_doses\":0,\"required_doses\":1,\"doses_remaining\":1,\"allocation_rank\":1,\"tie_break_order\":[\"series_completion\",\"schedule_label\",\"eligible_date\",\"patient_name\"],\"patient_name\":\"Tessie Account Torsion\",\"original_batch\":{\"id\":19,\"batch_number\":\"BCG-2026-001\",\"expiration_date\":\"2027-09-08\"}}','2026-09-10 08:23:59',NULL,NULL,NULL,'2026-09-10 08:23:59','2026-09-10 08:23:59'),(42,15,2,21,1,'2026-09-16','scheduled',0,0,'Current Age',1,'{\"priority_reason\":\"Current Age\",\"is_series_completion_candidate\":false,\"schedule_label\":\"Current Age\",\"recommended_date\":\"2026-09-01\",\"eligible_date\":\"2026-09-01\",\"completed_doses\":0,\"required_doses\":1,\"doses_remaining\":1,\"allocation_rank\":1,\"tie_break_order\":[\"series_completion\",\"schedule_label\",\"eligible_date\",\"patient_name\"],\"patient_name\":\"Tessie Account Torsion\",\"original_batch\":{\"id\":21,\"batch_number\":\"HPV-2026-000\",\"expiration_date\":\"2027-01-08\"}}','2026-09-10 08:23:59',NULL,NULL,NULL,'2026-09-10 08:23:59','2026-09-10 08:23:59');
/*!40000 ALTER TABLE `patient_vaccine_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_vaccines`
--

DROP TABLE IF EXISTS `patient_vaccines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patient_vaccines` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) unsigned NOT NULL,
  `vaccine_id` bigint(20) unsigned NOT NULL,
  `added_by` bigint(20) unsigned DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patient_vaccines_patient_id_vaccine_id_unique` (`patient_id`,`vaccine_id`),
  KEY `patient_vaccines_vaccine_id_foreign` (`vaccine_id`),
  KEY `patient_vaccines_added_by_foreign` (`added_by`),
  CONSTRAINT `patient_vaccines_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `patient_vaccines_patient_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `patient_vaccines_vaccine_id_foreign` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_vaccines`
--

LOCK TABLES `patient_vaccines` WRITE;
/*!40000 ALTER TABLE `patient_vaccines` DISABLE KEYS */;
/*!40000 ALTER TABLE `patient_vaccines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `patients` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `guardian_id` bigint(20) unsigned DEFAULT NULL,
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
  `birth_order` tinyint(3) unsigned DEFAULT NULL,
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
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `patients_patient_id_unique` (`patient_id`),
  KEY `patients_guardian_id_fk` (`guardian_id`),
  CONSTRAINT `patients_guardian_id_fk` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (14,5,'PT-000001','Christina','Alvarez','Hemsworth','Cristi',NULL,NULL,'2026-09-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Female','Zone 4, Balite','Mother',NULL,NULL,NULL,'Active','2026-09-10 08:08:16','2026-09-10 08:08:16'),(15,6,'PT-000002','Tessie','Account','Torsion','Testes',NULL,NULL,'2026-09-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Male','super test idol','Father',NULL,NULL,NULL,'Active','2026-09-10 08:23:59','2026-09-10 08:23:59');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Administrator','2026-09-10 04:25:01','2026-09-10 04:25:01'),(2,'nurse','Nurse','2026-09-10 04:25:01','2026-09-10 04:25:01'),(3,'midwife','Midwife','2026-09-10 04:25:01','2026-09-10 04:25:01'),(4,'bhw','Barangay Health Worker','2026-09-10 04:25:01','2026-09-10 04:25:01'),(5,'guardian','Parent / Guardian','2026-09-10 04:25:01','2026-09-10 04:25:01');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('19zD1q86pjy8zxrnek2D7TBzZvb8dNyLFcEmjHbo',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','YToyOntzOjY6Il90b2tlbiI7czo0MDoiMjdON0FXT056TUJaSnJidUFqRFk5RjZPekdWb1ZhQmhtR3BWOHBVZSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1789055587),('6A338WE1r8LUsCUiSq60Rlf0pFuW6hEb9AcFEIaW',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','YToyOntzOjY6Il90b2tlbiI7czo0MDoialVOZEpnTlREMzZxSHRVNVZrN0EwN09tbHZIOGpDdHo1NTNnekVGTyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1789054746),('a10fpNYgr3caMkc4Rh8KKah2G6M9B3MIeqEsek9D',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','YToyOntzOjY6Il90b2tlbiI7czo0MDoiUXV1bEI2Q0tRcFk1UGFJMGV6VlZxWUZBbVFoMUp5RjZuYU4wam5oRyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1789057481),('iVJutw5XUmbJntM9uR7dnVA1M3pP5isHgWLb3YbS',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','YToyOntzOjY6Il90b2tlbiI7czo0MDoiTE9KRDk4TmFYTWxFUDNVNzhEY3o3Z2YweUNabXRyNXhJcDJkUGJMdCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1789052704),('jizNUx1TXCOKkvkLQFAjL0NS8Rh00FpUs3app5li',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNGEyQ1kyYmZHWk9GN2RKa28ydVJzNU81bUg5eEJYZjB3Y0xvOEJkWSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7czo0OiJob21lIjt9fQ==',1789058201),('juk41CcBUGeLs32RZHw2R433lbso2LNZtRz4tYae',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','YToyOntzOjY6Il90b2tlbiI7czo0MDoiTWNTZkIzSXI4OERaZFY2Wk5abVR6RWtrOXFOV0lDZWJGcU9IeGwwUCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1789057294),('K0fwzIuvZhPa40tIyJ1UnEQVwUR4p0LqVa7nzCYx',20,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoibVp1WXdRQ2FaRU5SMW4xU2d4Y2ppb2dSdkd2QkM1TEd5T0UwZndOaCI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozMDoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL3BhdGllbnRzIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MjA7fQ==',1789057494),('PFNZSDtfn6frEzjMqxgSOi8qBY3LGDIUEZLCYjkI',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','YToyOntzOjY6Il90b2tlbiI7czo0MDoiYkswSjFmR29IT2lsYWhDTnpYbng1ZHlRWnRtTVNTTVN5Zk9ra1FEeSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1789054784),('r8kUPNgfd1Xbc6f9DlHcqr7jpqjKIhHYM0EvztYs',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','YToyOntzOjY6Il90b2tlbiI7czo0MDoiWWl5SEtXck5jbEw2aHR2cVdwekN0WlN3Y25pMHB1Q013WjRFMzNuQSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1789056721),('sFZEAJjziEwIPml1RdojBHL5c9ZSUdUEwd1favLf',19,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','YTo0OntzOjY6Il90b2tlbiI7czo0MDoieE94ZTFSR1l3djNmUmV1RGNJUkVwS0FvbmhadFplQTR6MllvT3lpdyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozNDoiaHR0cDovLzEyNy4wLjAuMTo4MDAwL2ltbXVuaXphdGlvbiI7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE5O30=',1789057231),('xo7ASjoMAq1ltPW7nrCRwLVbqi5bKG1EPQ5p9LQc',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.136.1 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','YToyOntzOjY6Il90b2tlbiI7czo0MDoiaUdydmR2ZVpWSVZ3NlZrSVVHemtuTTk1cGpSSlc5UUhnYVVYQ3FETSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1789056625);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` enum('admin','nurse','midwife','bhw','patient') NOT NULL DEFAULT 'patient',
  `role_id` bigint(20) unsigned DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `account_status` varchar(255) NOT NULL DEFAULT 'active',
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_id_fk` (`role_id`),
  CONSTRAINT `users_role_id_fk` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Brandolph Alerta','admin@bugohealthcenter.local','admin',1,'active','active',0,NULL,'$2y$12$qA0fJb90E69jggKgcSacwOxANUt1Nme2xgKy9Nu8w74quEOBkOfHS','DP8ayRX0gyTXcLPVDi8CfXpz0SI64k8xm7a68q7tLLWqDixIrINCttr4gbYk','2026-07-16 22:36:39','2026-08-12 22:40:54'),(4,'Arron Gabriel T. Sumilla','bhw@bugohealthcenter.local','bhw',4,'active','active',0,NULL,'$2y$12$gbfKgbeIJamaiez0q3h/DeJC62/9/l3VV8oAyIH6QJ/aULyTWzH5y',NULL,'2026-07-25 05:22:59','2026-07-25 05:59:22'),(5,'Justine V. Buico','nurse@bugohealthcenter.local','nurse',2,'active','active',0,NULL,'$2y$12$IOC/hjDAc4rVccSoefIV3efAT56xDML6z8.8JZZJv0yO7az4J/q9a',NULL,'2026-07-25 05:24:55','2026-07-25 05:24:55'),(6,'Johnbert S. Urgello','midwife@bugohealthcenter.local','midwife',3,'active','active',0,NULL,'$2y$12$DvIlxc530Dqq7a4xWJT/He1I.Q/dQDTUBjWDn4uyQMF1vSnzmtVY2',NULL,'2026-07-25 05:26:11','2026-08-30 22:39:32'),(19,'Adriana Alvarez','guardian@bugohealthcenter.local','patient',5,'active','active',0,NULL,'$2y$12$t.ddDWYxCbBGBaBxhCnaIeUhy81SYMZ/c9MrQvXTdqoJaRIfGrsfC',NULL,'2026-09-10 08:08:16','2026-09-10 08:20:46'),(20,'Test Account','testguardian@bugohealthcenter.local','patient',5,'active','active',0,NULL,'$2y$12$ordjNax5MhVHHZf/WvdSpuUGQPnTGsXlvtawPy57IC37TZhbneU4.',NULL,'2026-09-10 08:23:59','2026-09-10 08:25:11');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vaccine_inventories`
--

DROP TABLE IF EXISTS `vaccine_inventories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vaccine_inventories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `vaccine_id` bigint(20) unsigned DEFAULT NULL,
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
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vaccine_inventories_batch_number_unique` (`batch_number`),
  KEY `vaccine_inventories_vaccine_id_foreign` (`vaccine_id`),
  CONSTRAINT `vaccine_inventories_vaccine_id_foreign` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaccine_inventories`
--

LOCK TABLES `vaccine_inventories` WRITE;
/*!40000 ALTER TABLE `vaccine_inventories` DISABLE KEYS */;
INSERT INTO `vaccine_inventories` VALUES (19,1,'BCG-2026-001',45,'2026-09-01','2027-09-08',NULL,NULL,NULL,0,NULL,NULL,'2026-09-08 06:26:38','2026-09-08 06:26:38'),(20,2,'HPB-2026-001',30,'2026-09-01','2027-09-09',NULL,NULL,NULL,0,NULL,NULL,'2026-09-08 06:27:23','2026-09-08 06:27:23'),(21,2,'HPV-2026-000',13,'2026-01-01','2027-01-08',NULL,NULL,NULL,0,NULL,NULL,'2026-09-08 06:28:19','2026-09-08 07:00:08'),(22,3,'PTV-2026-001',30,'2026-09-08','2027-05-15',NULL,NULL,NULL,0,NULL,NULL,'2026-09-08 06:42:40','2026-09-08 06:42:40'),(23,1,'BCG-2026-002',30,'2026-09-09','2027-10-12',NULL,NULL,NULL,0,NULL,NULL,'2026-09-08 08:13:25','2026-09-08 08:13:25');
/*!40000 ALTER TABLE `vaccine_inventories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vaccine_schedules`
--

DROP TABLE IF EXISTS `vaccine_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vaccine_schedules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `vaccine_id` bigint(20) unsigned NOT NULL,
  `dose_number` tinyint(3) unsigned NOT NULL,
  `recommended_age` varchar(255) NOT NULL,
  `interval` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vaccine_schedules_vaccine_id_dose_number_unique` (`vaccine_id`,`dose_number`),
  CONSTRAINT `vaccine_schedules_vaccine_id_foreign` FOREIGN KEY (`vaccine_id`) REFERENCES `vaccines` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaccine_schedules`
--

LOCK TABLES `vaccine_schedules` WRITE;
/*!40000 ALTER TABLE `vaccine_schedules` DISABLE KEYS */;
INSERT INTO `vaccine_schedules` VALUES (8,2,1,'0 days',NULL,'2026-08-21 07:10:27','2026-08-21 07:10:27'),(12,4,1,'1.5 months',NULL,'2026-08-21 07:10:27','2026-08-21 07:10:27'),(13,4,2,'2.5 months',30,'2026-08-21 07:10:27','2026-08-21 07:10:27'),(14,4,3,'3.5 months',30,'2026-08-21 07:10:27','2026-08-21 07:10:27'),(15,5,1,'3.5 months',NULL,'2026-08-21 07:10:27','2026-08-21 07:10:27'),(16,5,2,'9 months',165,'2026-08-21 07:10:27','2026-08-21 07:10:27'),(17,6,1,'1.5 months',NULL,'2026-08-21 07:10:27','2026-08-21 07:10:27'),(18,6,2,'2.5 months',30,'2026-08-21 07:10:27','2026-08-21 07:10:27'),(19,6,3,'3.5 months',30,'2026-08-21 07:10:27','2026-08-21 07:10:27'),(20,7,1,'9 months',NULL,'2026-08-21 07:10:27','2026-08-21 07:10:27'),(21,7,2,'1 year',95,'2026-08-21 07:10:27','2026-08-21 07:10:27'),(22,1,1,'0 days',NULL,'2026-08-26 20:30:21','2026-08-26 20:30:21'),(23,3,1,'1.5 months',NULL,'2026-08-26 20:30:55','2026-08-26 20:30:55'),(24,3,2,'2.5 months',30,'2026-08-26 20:30:55','2026-08-26 20:30:55'),(25,3,3,'3.5 months',30,'2026-08-26 20:30:55','2026-08-26 20:30:55');
/*!40000 ALTER TABLE `vaccine_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vaccines`
--

DROP TABLE IF EXISTS `vaccines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vaccines` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `required_doses` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `category` varchar(255) NOT NULL DEFAULT 'routine',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vaccines_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vaccines`
--

LOCK TABLES `vaccines` WRITE;
/*!40000 ALTER TABLE `vaccines` DISABLE KEYS */;
INSERT INTO `vaccines` VALUES (1,'BCG','Bacillus Calmette-Guérin vaccine.',1,'routine','2026-08-11 05:38:31','2026-08-11 05:38:31'),(2,'Hepatitis B','Hepatitis B vaccine.',1,'routine','2026-08-11 05:38:31','2026-08-11 05:38:31'),(3,'Pentavalent','DPT-Hep B-Hib vaccine.',3,'routine','2026-08-11 05:38:31','2026-08-11 05:38:31'),(4,'OPV','Oral Polio Vaccine.',3,'routine','2026-08-11 05:38:31','2026-08-11 05:38:31'),(5,'IPV','Inactivated Polio Vaccine.',2,'routine','2026-08-11 05:38:31','2026-08-11 05:38:31'),(6,'PCV','Pneumococcal Conjugate Vaccine.',3,'routine','2026-08-11 05:38:31','2026-08-11 05:38:31'),(7,'MMR','Measles, Mumps, and Rubella vaccine.',2,'routine','2026-08-11 05:38:31','2026-08-11 05:38:31');
/*!40000 ALTER TABLE `vaccines` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-15 16:24:57
