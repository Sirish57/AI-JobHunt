export default function JobCard({ job }) {
    return (
        <div className="job-card">
            <h3>{job.title}</h3>
            <p>{job.company} • {job.location}</p>
            <p>{job.contractType} • {job.experienceLevel}</p>
        </div>
    );
}