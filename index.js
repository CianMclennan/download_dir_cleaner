const os = require('os');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const dateFormat = require('dateformat');
const notifier = require('node-notifier');
const dateStamp = dateFormat(new Date(), 'hhmmss_ddmmyyyy');

const day = 86400000; // milliseconds

const downloadsDir = path.join(os.homedir(), 'Downloads');

const deleteFileActions = fs
	.readdirSync(downloadsDir)

	// get full path to each file.
	.map((file) => path.join(downloadsDir, file))

	// filter to only files that have not been modified in the last 7 days.
	.filter((file) => {
		const stat = fs.statSync(file),
			now = new Date().getTime(),
			endTime = new Date(stat.ctime).getTime() + 7 * day;
		return now > endTime;
	})

	// create promises for deleting files.
	.map((file) => new Promise((resolve) => rimraf(file, () => resolve(file))));

Promise.all(deleteFileActions).then((deletedFiles) => {
	if (!deletedFiles.length) return;
	fs.writeFile(
		path.join(downloadsDir, `deleted_${dateStamp}.log`),
		deletedFiles.join('\n')
	);
	notifier.notify({
		message: `${deletedFiles.length} files deleted.`,
		wait: true,
	});
});
