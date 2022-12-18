using System.Diagnostics;
using Application.Activities;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ActivitiesController : BaseApiController
{
    [HttpGet] //api/activities
    public async Task<ActionResult<List<Activity>>> GetActivities()
    {
        return Ok(await Mediator.Send(new List.Query()));
    }

    [HttpGet("{id}")] //api/activities/abc123
    public async Task<ActionResult<Activity>> GetActivity(Guid id)
    {
        return Ok(await Mediator.Send(new Details.Query { Id = id }));
    }

    [HttpPost] //api/activities/Add
    public async Task<IActionResult> CreateActivity(Domain.Activity activity)
    {
        return Ok(await Mediator.Send(new Create.Command { Activity = activity }));
    }

    [HttpPut("{id}")] //api/activities/Edit
    public async Task<IActionResult> EditActivity(Guid id, Domain.Activity activity)
    {
        activity.Id = id;
        return Ok(await Mediator.Send(new Edit.Command { Activity = activity }));
    }

    [HttpDelete("{id}")] //api/activities/Delete
    public async Task<IActionResult> DeleteActivity(Guid id)
    {
        return Ok(await Mediator.Send(new Delete.Command { Id = id }));
    }
}