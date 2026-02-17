# Backup & Restore

Comprehensive guide for backing up and restoring CX Linux systems.

## Backup Strategy

```mermaid
graph TB
    A[Backup Strategy] --> B[Full System]
    A --> C[Application Data]
    A --> D[Configuration]

    B --> B1[Disk Image]
    B --> B2[Partition Clone]

    C --> C1[Database]
    C --> C2[User Data]
    C --> C3[Container Volumes]

    D --> D1[/etc/cx]
    D --> D2[Service Configs]
    D --> D3[Secrets]
```

## What to Back Up

### Critical Data

| Data | Location | Frequency |
|------|----------|-----------|
| Cortex Config | `/etc/cx/` | On change |
| Application Data | `/var/lib/cx/` | Daily |
| User Data | `/home/` | Daily |
| Databases | `/var/lib/postgresql/` | Hourly |
| Secrets | Varies | On change |

### System Configuration

```bash
# Essential system files
/etc/passwd
/etc/shadow
/etc/group
/etc/sudoers.d/
/etc/ssh/
/etc/netplan/
/etc/fstab
/etc/crontab
```

---

## Backup Methods

### Using Cortex Snapshots

The built-in snapshot system creates recovery points:

```bash
# Create snapshot
cx-ops update rollback --list  # View existing

# Snapshots are created automatically before updates
cx-ops update apply --packages
```

### Using rsync

```bash
# Backup to remote server
rsync -avz --delete \
  --exclude='/proc/*' \
  --exclude='/sys/*' \
  --exclude='/dev/*' \
  --exclude='/tmp/*' \
  --exclude='/var/cache/*' \
  / backup@server:/backups/cx/

# Backup specific directories
rsync -avz /etc/cx/ backup@server:/backups/cx/config/
rsync -avz /var/lib/cx/ backup@server:/backups/cx/data/
```

### Using tar

```bash
# Create compressed archive
tar -czvf /backup/cx-config-$(date +%Y%m%d).tar.gz \
  /etc/cx/ \
  /var/lib/cx/

# Exclude unnecessary files
tar -czvf /backup/full-backup.tar.gz \
  --exclude='/proc' \
  --exclude='/sys' \
  --exclude='/dev' \
  --exclude='/tmp' \
  --exclude='/var/cache' \
  /
```

### Using dd (Disk Image)

```bash
# Full disk image
sudo dd if=/dev/sda of=/backup/disk.img bs=4M status=progress

# Compressed image
sudo dd if=/dev/sda bs=4M status=progress | gzip > /backup/disk.img.gz

# Image specific partition
sudo dd if=/dev/sda1 of=/backup/root.img bs=4M status=progress
```

### Using Restic

```bash
# Install restic
sudo apt install restic

# Initialize repository
restic init --repo /backup/restic

# Create backup
restic -r /backup/restic backup /etc/cx /var/lib/cx

# Create backup to S3
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
restic -r s3:s3.amazonaws.com/bucket/cx backup /etc/cx

# List snapshots
restic -r /backup/restic snapshots

# Restore
restic -r /backup/restic restore latest --target /restore
```

---

## Automated Backups

### Cron Job

```bash
# /etc/cron.d/cx-backup
# Daily backup at 2 AM
0 2 * * * root /usr/local/bin/cx-backup.sh

# Hourly database backup
0 * * * * postgres pg_dump cx_db > /backup/db/cx-$(date +\%H).sql
```

### Backup Script

```bash
#!/bin/bash
# /usr/local/bin/cx-backup.sh

set -e

BACKUP_DIR="/backup/cx"
DATE=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=30

echo "Starting backup: $DATE"

# Create backup directory
mkdir -p "$BACKUP_DIR/$DATE"

# Backup configuration
tar -czf "$BACKUP_DIR/$DATE/config.tar.gz" /etc/cx/

# Backup data
tar -czf "$BACKUP_DIR/$DATE/data.tar.gz" /var/lib/cx/

# Backup databases
pg_dumpall > "$BACKUP_DIR/$DATE/databases.sql"

# Create checksum
cd "$BACKUP_DIR/$DATE"
sha256sum * > checksums.sha256

# Upload to remote (optional)
rsync -avz "$BACKUP_DIR/$DATE" backup@remote:/backups/cx/

# Clean old backups
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;

echo "Backup completed: $DATE"
```

### Systemd Timer

```ini
# /etc/systemd/system/cx-backup.service
[Unit]
Description=Cortex Backup Service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/cx-backup.sh
```

```ini
# /etc/systemd/system/cx-backup.timer
[Unit]
Description=Daily Cortex Backup

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl enable cx-backup.timer
sudo systemctl start cx-backup.timer
```

---

## Database Backups

### PostgreSQL

```bash
# Dump single database
pg_dump -U postgres cx_db > cx_db.sql

# Dump all databases
pg_dumpall -U postgres > all_databases.sql

# Compressed dump
pg_dump -U postgres cx_db | gzip > cx_db.sql.gz

# Custom format (faster restore)
pg_dump -U postgres -Fc cx_db > cx_db.dump

# Restore
psql -U postgres cx_db < cx_db.sql
pg_restore -U postgres -d cx_db cx_db.dump
```

### SQLite

```bash
# Backup
sqlite3 /var/lib/cx/data.db ".backup '/backup/data.db'"

# Or simply copy (when not in use)
cp /var/lib/cx/data.db /backup/

# Restore
cp /backup/data.db /var/lib/cx/data.db
```

### Redis

```bash
# Trigger RDB snapshot
redis-cli BGSAVE

# Copy RDB file
cp /var/lib/redis/dump.rdb /backup/redis-$(date +%Y%m%d).rdb

# Restore
sudo systemctl stop redis
cp /backup/redis-YYYYMMDD.rdb /var/lib/redis/dump.rdb
sudo chown redis:redis /var/lib/redis/dump.rdb
sudo systemctl start redis
```

---

## Restore Procedures

### Restore Configuration

```bash
# From tar archive
tar -xzf config.tar.gz -C /

# From rsync backup
rsync -avz backup@server:/backups/cx/config/ /etc/cx/

# Verify and restart services
cx config validate
sudo systemctl restart cx
```

### Restore Full System

```bash
# Boot from live USB

# Mount target disk
mount /dev/sda1 /mnt

# Restore from archive
tar -xzf full-backup.tar.gz -C /mnt

# Restore bootloader
mount --bind /dev /mnt/dev
mount --bind /proc /mnt/proc
mount --bind /sys /mnt/sys
chroot /mnt
grub-install /dev/sda
update-grub
exit

# Unmount and reboot
umount -R /mnt
reboot
```

### Restore from Disk Image

```bash
# Restore full disk
sudo dd if=/backup/disk.img of=/dev/sda bs=4M status=progress

# Restore compressed image
gunzip -c /backup/disk.img.gz | sudo dd of=/dev/sda bs=4M status=progress

# Restore partition
sudo dd if=/backup/root.img of=/dev/sda1 bs=4M status=progress
```

### Restore from Restic

```bash
# List snapshots
restic -r /backup/restic snapshots

# Restore specific snapshot
restic -r /backup/restic restore abc123 --target /

# Restore specific files
restic -r /backup/restic restore latest --target /restore \
  --include "/etc/cx/*"
```

---

## Disaster Recovery

### Recovery Checklist

1. **Assess the situation**
   - What failed? Hardware, software, data?
   - What data is affected?
   - What's the recovery time objective (RTO)?

2. **Prepare recovery environment**
   - Boot from live USB or recovery media
   - Ensure backup media is accessible
   - Verify backup integrity

3. **Restore system**
   - Start with base system restore
   - Apply configuration
   - Restore application data
   - Restore databases

4. **Verify restoration**
   - Run health checks: `cx-ops doctor`
   - Verify critical services
   - Test application functionality
   - Verify data integrity

### Bare Metal Recovery

```bash
# 1. Boot from CX Linux USB

# 2. Partition disk
fdisk /dev/sda
# Create partitions as needed

# 3. Format partitions
mkfs.ext4 /dev/sda1
mkswap /dev/sda2

# 4. Mount target
mount /dev/sda1 /mnt

# 5. Restore from backup
rsync -avz backup@server:/backups/cx/latest/ /mnt/

# 6. Install bootloader
for i in dev proc sys; do mount --bind /$i /mnt/$i; done
chroot /mnt
grub-install /dev/sda
update-grub
exit

# 7. Configure fstab
nano /mnt/etc/fstab

# 8. Reboot
umount -R /mnt
reboot
```

---

## Verification

### Verify Backup Integrity

```bash
# Check archive integrity
tar -tzf backup.tar.gz > /dev/null && echo "Archive OK"

# Verify checksums
sha256sum -c checksums.sha256

# Test restore to temporary location
mkdir /tmp/restore-test
tar -xzf backup.tar.gz -C /tmp/restore-test
ls /tmp/restore-test/etc/cx/
```

### Backup Monitoring

```bash
#!/bin/bash
# /usr/local/bin/check-backup.sh

BACKUP_DIR="/backup/cx"
MAX_AGE_HOURS=24

# Find latest backup
LATEST=$(ls -t "$BACKUP_DIR" | head -1)
LATEST_PATH="$BACKUP_DIR/$LATEST"

# Check age
AGE_HOURS=$(( ($(date +%s) - $(stat -c %Y "$LATEST_PATH")) / 3600 ))

if [ $AGE_HOURS -gt $MAX_AGE_HOURS ]; then
    echo "CRITICAL: Latest backup is $AGE_HOURS hours old"
    exit 2
fi

# Check size
SIZE=$(du -s "$LATEST_PATH" | cut -f1)
if [ $SIZE -lt 1000 ]; then
    echo "WARNING: Backup size suspiciously small: $SIZE KB"
    exit 1
fi

echo "OK: Latest backup from $LATEST ($AGE_HOURS hours ago)"
exit 0
```

---

## Best Practices

1. **3-2-1 Rule**: Keep 3 copies on 2 different media types with 1 offsite
2. **Test restores regularly**: Schedule quarterly restore tests
3. **Encrypt sensitive backups**: Use GPG or built-in encryption
4. **Monitor backup jobs**: Alert on failures
5. **Document procedures**: Keep runbooks updated
6. **Automate everything**: Human error is the biggest risk
