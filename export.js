const fs = require('fs');

const isNewTasklistFormat = false;

// Check if a filename is provided as a command line argument
const filePath = process.argv[2];
if (!filePath) {
    console.error('Please provide the JSON file path as a command line argument.');
    process.exit(1);
}

// Read input JSON from file
const jsonString = fs.readFileSync(filePath, 'utf8');
const json = JSON.parse(jsonString);

function generateBucketList(json) {
    const projectId = json.project.id;
    const buckets = json.buckets || [];
    const sortedBuckets =
        buckets
            .filter(bucket => (bucket.projectId === projectId) && bucket.name !== "")
            .sort((a, b) => a.priority - b.priority);

    return sortedBuckets;
}

function generateTaskList(json, bucket) {
    const bucketId = bucket.id;
    const tasks = json.tasks || [];
    const sortedTasks =
        tasks
            .filter(task => task.bucketId === bucketId)
            .sort((a, b) => a.priority - b.priority);

    // if (sortedTasks.length === 0) {
    //     return null; // Skip empty buckets
    // }

    const taskList = sortedTasks.map(task => {
        const checkbox = task.closed ? '[x]' : '[ ]';
        return `- ${checkbox} ${task.title}`;
    });

    const isFiguredOut = !bucket.done && sortedTasks.every(task => task.closed);
    if (bucket.flagged) {
        bucketState = 'Flagged';
    } else if (bucket.done) {
        bucketState = 'Done';
    } else if (isFiguredOut) {
        bucketState = 'Figured out';
    } else {
        bucketState = '';
    }

    const allTasks = taskList.join('\n');

    return `### ${bucket.name} ${bucketState !== '' ? ' - ' : ''}${bucketState}\n${allTasks}\n`;
}

function generateNewTaskList(json, bucket) {
    return `\`\`\`[tasklist]\n${generateTaskList(json, bucket)}\n\`\`\``;
}

function generateMarkdown(json) {
    const buckets = generateBucketList(json);

    const genTaskList = isNewTasklistFormat ? generateNewTaskList : generateTaskList;

    var markdown = buckets.map(bucket => genTaskList(json, bucket));//.filter(Boolean);

    const project = json.project;
    const projectURL = `https://dump.link/a/${project.id}`;
    const projectInfo = `
# Project: [${project.name}](${projectURL})

Appetite: ${project.appetite} weeks
Updated at: ${project.updatedAt}\n
`;

    markdown.unshift(projectInfo);
    return markdown.join('\n');
}

const githubMarkdown = generateMarkdown(json);
console.log(githubMarkdown);
