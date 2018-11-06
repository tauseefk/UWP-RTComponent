using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SampleComponent
{
    public sealed class Example
    {
        public static string GetAnswer()
        {
            return "The answer is 42.";
        }

        public int SampleProperty { get; set; }
    }
}
