using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ActivitiesController : ControllerBase
{
    private readonly DataContext _context;

    public ActivitiesController(DataContext context)
    {
        _context = context;
    }

    [HttpGet] //api/activities
    public async Task<ActionResult<List<Activity>>> GetActivities()
    {
        return Ok(await _context.Activities.ToListAsync());
    }

    [HttpGet("{id}")] //api/activities/abc123
    public async Task<ActionResult<Activity>> GetActivity(Guid id)
    {
        return Ok(await _context.Activities.FindAsync(id));
    }
}